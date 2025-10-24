/**
 * Story Mode Zombie Spawner
 * Spawns zombies for story mode waves
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { createZombie } from '../entities/ZombieFactory'
import { ZOMBIE_SPAWNS, ZOMBIE_SPAWN_INTERVAL } from '../utils/constants'
import { STORY_WAVES } from '../utils/storyConfig'

let lastSpawnTime = 0

/**
 * Story mode zombie spawn system
 */
export function storyZombieSpawnSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const gameState = GameState.get(gameStateEntity)

  // Only spawn in story mode
  if (!gameState.storyMode) return

  // Don't spawn if boss already spawned
  if (gameState.bossSpawned) return

  // Get wave config
  const waveConfig = STORY_WAVES[gameState.currentWave - 1]
  if (!waveConfig) return

  // Check if we've spawned enough zombies for this wave
  if (gameState.zombiesKilledThisWave >= waveConfig.zombieCount) {
    return // Stop spawning, let boss spawn
  }

  const currentTime = Date.now()

  // Spawn zombies at intervals
  if (currentTime - lastSpawnTime >= ZOMBIE_SPAWN_INTERVAL) {
    // Spawn 1-2 zombies at a time
    const spawnCount = Math.floor(Math.random() * 2) + 1

    for (let i = 0; i < spawnCount; i++) {
      const spawnIndex = Math.floor(Math.random() * ZOMBIE_SPAWNS.length)
      createZombie(ZOMBIE_SPAWNS[spawnIndex])
    }

    lastSpawnTime = currentTime
    console.log(`🧟 Spawned ${spawnCount} zombies for wave ${gameState.currentWave}`)
  }
}

/**
 * Reset story zombie spawner (for wave reset)
 */
export function resetStoryZombieSpawner(): void {
  lastSpawnTime = 0
}
