/**
 * Wave Management for Neural Collapse
 * Handles zombie wave spawning and progression
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { createZombie } from '../entities/ZombieFactory'
import { ZOMBIE_SPAWNS, ZOMBIE_SPAWN_INTERVAL, ZOMBIE_SPAWN_BATCH_SIZE } from '../utils/constants'
import { playSound } from '../audio/SoundManager'
import * as utils from '@dcl-sdk/utils'

/**
 * Spawn the next wave of zombies
 */
export function spawnNextWave() {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.currentWave += 1
  const waveNumber = gameState.currentWave

  // Calculate zombies to spawn (scales with wave)
  const zombiesToSpawn = waveNumber * 2

  // Set total zombies for the wave
  gameState.totalZombiesForWave = zombiesToSpawn
  gameState.zombiesRemaining = zombiesToSpawn
  gameState.nextSpawnTime = Date.now()

  // Play start round sound
  playSound('startRound', 'sounds/startRound.mp3')

  console.log(`Wave ${waveNumber} started with ${zombiesToSpawn} zombies`)
}

/**
 * Handle staggered zombie spawning (called from system)
 */
export function handleZombieSpawning(): boolean {
  const gameState = GameState.getMutable(gameStateEntity)
  const currentTime = Date.now()

  // Check if it's time to spawn more zombies
  if (gameState.totalZombiesForWave > 0 && currentTime >= gameState.nextSpawnTime) {
    // Spawn zombies one at a time with small delays for smooth performance
    const zombiesToSpawn = Math.min(ZOMBIE_SPAWN_BATCH_SIZE, gameState.totalZombiesForWave)

    // Spawn zombies with staggered timing (100ms between each)
    for (let i = 0; i < zombiesToSpawn; i++) {
      utils.timers.setTimeout(() => {
        const spawnIndex = i % ZOMBIE_SPAWNS.length
        createZombie(ZOMBIE_SPAWNS[spawnIndex])
      }, i * 100) // 100ms delay between each zombie spawn
    }

    // Decrement total zombies to spawn
    gameState.totalZombiesForWave -= zombiesToSpawn

    // Set next spawn time (longer to account for staggered spawns)
    gameState.nextSpawnTime = currentTime + ZOMBIE_SPAWN_INTERVAL + zombiesToSpawn * 100

    return true
  }

  return false
}

/**
 * Check if wave is complete and spawn next wave
 */
export function checkWaveCompletion(): boolean {
  const gameState = GameState.getMutable(gameStateEntity)
  const currentTime = Date.now()

  // If all zombies are dead but we haven't set transition time yet
  if (gameState.zombiesRemaining <= 0 && gameState.totalZombiesForWave <= 0 && gameState.waveTransitionTime === 0) {
    // Set transition time to wait 2 seconds for death animations to finish
    gameState.waveTransitionTime = currentTime + 3000
    console.log('Wave complete! Next wave in 3 seconds...')
    return false
  }

  // If transition time is set and has passed, start next wave
  if (gameState.waveTransitionTime > 0 && currentTime >= gameState.waveTransitionTime) {
    gameState.waveTransitionTime = 0
    spawnNextWave()
    return true
  }

  return false
}
