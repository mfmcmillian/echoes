/**
 * Game State System for Neural Collapse
 * Handles game state transitions and input
 */

import { engine, InputAction, PointerEventType, inputSystem, AudioSource, InputModifier } from '@dcl/sdk/ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity, updateLastShotTime, setPaused } from '../core/GameState'
import { pauseSoundEntity } from '../audio/SoundManager'
import { startGame, restartGame } from '../core/GameController.js'
import { forceCleanupCutscene } from '../ui/IntroCutscene'

/**
 * Game State System
 */
export function gameStateSystem(dt: number) {
  const gameState = GameState.get(gameStateEntity)

  // Start game from menu
  if (gameState.phase === 'menu' && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('E key pressed - cleaning up cutscene with fade...')

    // Clean up cutscene with fade, then start game
    forceCleanupCutscene(() => {
      // CRITICAL: Enable controls immediately
      InputModifier.createOrReplace(engine.PlayerEntity, {
        mode: {
          $case: 'standard',
          standard: {
            disableWalk: false,
            disableRun: false,
            disableJog: false,
            disableJump: false
          }
        }
      })
      console.log('✅ Controls enabled in gameStateSystem')

      console.log('Starting game...')
      startGame()
    })
  }

  // Restart from game over
  if (gameState.phase === 'gameOver' && inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
    console.log('Restarting game...')
    restartGame()
  }

  // Resume from pause with E key
  if (
    gameState.phase === 'playing' &&
    gameState.paused &&
    inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)
  ) {
    console.log('Resuming game...')
    setPaused(false)
    AudioSource.playSound(pauseSoundEntity, 'sounds/zombie-sounds/pause-button.mp3')
    updateLastShotTime()
  }
}
