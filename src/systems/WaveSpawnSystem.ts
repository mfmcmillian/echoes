/**
 * Wave Spawn System for Neural Collapse
 * Handles staggered zombie spawning during waves
 */

import { GameState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { handleZombieSpawning, checkWaveCompletion } from '../features/WaveManager'

/**
 * Wave Spawn System - spawns zombies at intervals and checks for wave completion
 */
export function waveSpawnSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Handle spawning new zombies
  handleZombieSpawning()

  // Check if wave is complete and handle transition delay
  checkWaveCompletion()
}
