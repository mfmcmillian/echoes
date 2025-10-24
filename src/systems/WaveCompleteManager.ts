/**
 * Wave Complete Manager
 * Handles wave complete UI flow
 */

import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { WaveCompleteScreen, resetWaveComplete, triggerWaveComplete } from '../ui/WaveCompleteScreen'
import { MainUI } from '../ui/GameUI'

let isWaveCompleteActive = false
let currentWave = 0

/**
 * Start wave complete screen
 */
export function startWaveComplete(waveNumber: number): void {
  console.log(`🎬 Starting wave ${waveNumber} complete screen...`)

  isWaveCompleteActive = true
  currentWave = waveNumber
  resetWaveComplete()

  // Set UI to wave complete screen
  ReactEcsRenderer.setUiRenderer(() =>
    WaveCompleteScreen({
      waveNumber,
      onComplete: handleWaveCompleteFinished
    })
  )
}

/**
 * Handle wave complete screen finished
 */
function handleWaveCompleteFinished(): void {
  console.log(`✅ Wave complete screen finished, showing dialogue...`)

  isWaveCompleteActive = false

  // Switch back to main UI
  ReactEcsRenderer.setUiRenderer(MainUI)

  // Trigger dialogue phase
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.phase = 'waveDialogue'
}

/**
 * Check if wave complete is active
 */
export function isWaveCompleteActiveCheck(): boolean {
  return isWaveCompleteActive
}

/**
 * Handle skip wave complete (E key)
 */
export function handleContinueWaveComplete(): void {
  if (isWaveCompleteActive) {
    triggerWaveComplete()
  }
}

/**
 * Wave complete system - checks game state and shows screen when needed
 */
export function waveCompleteSystem(dt: number): void {
  const gameState = GameState.get(gameStateEntity)

  // Check if we need to show wave complete
  if (gameState.phase === 'waveComplete' && !isWaveCompleteActive) {
    startWaveComplete(gameState.currentWave)
  }
}
