/**
 * Story Wave Manager
 * Manages story mode progression, wave completion, and boss spawning
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { STORY_WAVES } from '../utils/storyConfig'
import { spawnMiniBosses, spawnBigBoss, areBossesAlive } from '../systems/BossZombieSystem'
import { resetAllySystem, removeAllAllies } from '../systems/AllyZombieSystem'
import { resetFighterWeapon, removeAllProjectiles } from '../systems/FighterWeaponSystem'
import { removeAllZombies } from '../entities/ZombieFactory'
import { resetStoryZombieSpawner } from '../systems/StoryZombieSpawner'
import { removeAllUpgradeBoxes } from '../systems/UpgradeBoxSystem'
import { removeAllPowerUps } from '../systems/MovingPowerUpSystem'
import { removeAllWeaponBoxes } from '../systems/WeaponBoxSystem'
import * as utils from '@dcl-sdk/utils'

/**
 * Start a story mode wave
 */
export function startStoryWave(waveNumber: number): void {
  console.log(`📖 Starting Story Wave ${waveNumber}`)

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.currentWave = waveNumber
  gameState.zombiesKilledThisWave = 0
  gameState.bossSpawned = false
  gameState.bossAlive = false
  gameState.phase = 'playing'
  gameState.storyMode = true

  // Reset allies to 0 at start of each wave
  resetAllySystem()

  // Reset weapon to pistol at start of each wave
  resetFighterWeapon()

  // Reset zombie spawner
  resetStoryZombieSpawner()

  // Remove any leftover zombies from previous wave
  removeAllZombies()

  console.log(`✅ Wave ${waveNumber} ready. Allies reset. Weapon reset to pistol. Zombie spawner reset.`)
}

/**
 * Check if it's time to spawn the boss
 */
export function checkBossSpawn(): void {
  const gameState = GameState.get(gameStateEntity)

  // Only in story mode
  if (!gameState.storyMode) {
    console.log('❌ Boss spawn check: Not in story mode')
    return
  }

  // Boss already spawned
  if (gameState.bossSpawned) {
    return // Don't log spam
  }

  // Get current wave config
  const waveConfig = STORY_WAVES[gameState.currentWave - 1]
  if (!waveConfig) {
    console.log(`❌ Boss spawn check: No wave config for wave ${gameState.currentWave}`)
    return
  }

  console.log(`🔍 Boss spawn check: ${gameState.zombiesKilledThisWave}/${waveConfig.zombieCount} kills`)

  // Check if enough zombies killed
  if (gameState.zombiesKilledThisWave >= waveConfig.zombieCount) {
    console.log(`👹 Spawning bosses for wave ${gameState.currentWave}!`)

    // Spawn mini-bosses
    if (waveConfig.miniBosses > 0) {
      spawnMiniBosses(waveConfig.miniBosses, gameState.currentWave)
    }

    // Spawn big boss
    if (waveConfig.bigBoss) {
      spawnBigBoss(gameState.currentWave)
    }
  }
}

/**
 * Check if wave is complete (all bosses dead)
 */
export function checkWaveCompletion(): void {
  const gameState = GameState.get(gameStateEntity)

  // Only in story mode
  if (!gameState.storyMode) return

  // Boss must be spawned
  if (!gameState.bossSpawned) return

  // Boss must be alive
  if (!gameState.bossAlive) return

  // Check if all bosses are dead
  if (!areBossesAlive()) {
    console.log(`✅ All bosses defeated! Wave ${gameState.currentWave} complete!`)

    // Mark boss as dead
    const mutableGameState = GameState.getMutable(gameStateEntity)
    mutableGameState.bossAlive = false

    // Clean up the scene immediately
    console.log(`🧹 Cleaning up scene...`)
    removeAllZombies() // Remove all zombies (including dead boss)
    removeAllAllies() // Remove all ally zombies
    removeAllProjectiles() // Remove all bullets/projectiles
    removeAllUpgradeBoxes() // Remove blue/red boxes
    removeAllPowerUps() // Remove powerups (nuke, fire rate, etc)
    removeAllWeaponBoxes() // Remove weapon pickup boxes

    // Wait 1 second, then show wave complete screen
    utils.timers.setTimeout(() => {
      handleWaveVictory()
    }, 1000) // 1 second pause to let action settle
  }
}

/**
 * Handle wave victory
 */
function handleWaveVictory(): void {
  const gameState = GameState.getMutable(gameStateEntity)

  // Check if we just completed wave 5 (story complete)
  if (gameState.currentWave >= 5) {
    console.log(`🎉 Story Mode Complete! Unlocked Endless Mode!`)
    gameState.phase = 'victory'
  } else {
    // Show wave complete screen first
    console.log(`🎉 Showing wave ${gameState.currentWave} complete screen...`)
    gameState.phase = 'waveComplete' // New phase for completion screen
  }
}

/**
 * Proceed to next wave
 */
export function proceedToNextWave(): void {
  const gameState = GameState.get(gameStateEntity)
  const nextWave = gameState.currentWave + 1

  if (nextWave <= 5) {
    startStoryWave(nextWave)
  }
}

/**
 * Start endless mode after story completion
 */
export function startEndlessMode(): void {
  console.log(`♾️ Starting Endless Mode!`)

  const gameState = GameState.getMutable(gameStateEntity)
  gameState.storyMode = false
  gameState.currentWave = 6 // Continue from wave 6
  gameState.phase = 'playing'
  gameState.zombiesKilledThisWave = 0
  gameState.bossSpawned = false
  gameState.bossAlive = false

  // Reset allies to 0
  resetAllySystem()

  // Reset weapon to pistol
  resetFighterWeapon()

  console.log(`✅ Endless mode started at wave 6`)
}
