/**
 * Zombie AI System for Neural Collapse
 * Handles zombie movement, pathfinding, and attacks
 * NOW TARGETS THE PLAYER FIGHTER (zombie) instead of player avatar
 */

import { engine, Transform, Animator, Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Zombie, Health, DyingZombie, GameState, AnimationState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { playZombieAttackSound } from '../audio/SoundManager'
import { showGameOver } from '../core/GameController'
import { PlayerFighter } from './PlayerFighterSystem'

// Track zombie attack cooldowns and active sounds
const zombieAttackCooldowns = new Map<number, number>()
const activeZombieAttackSounds = new Map<number, number>()

/**
 * Get the player fighter entity (zombie we control)
 */
function getPlayerFighterEntity(): { entity: Entity; position: Vector3 } | null {
  for (const [entity, fighter] of engine.getEntitiesWith(PlayerFighter, Transform)) {
    const transform = Transform.get(entity)
    return { entity, position: transform.position }
  }
  return null
}

/**
 * Zombie AI System - handles movement and attacks
 * NOW ATTACKS THE FIGHTER ZOMBIE, NOT THE PLAYER AVATAR
 */
export function zombieSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Get the player's fighter (zombie we control)
  const playerFighterData = getPlayerFighterEntity()
  if (!playerFighterData) return

  const playerPosition = playerFighterData.position
  const playerFighterEntity = playerFighterData.entity

  const gameState = GameState.get(gameStateEntity)
  const baseSpeed = 0.5 + gameState.currentWave * 0.2

  for (const [entity, zombie, transform] of engine.getEntitiesWith(Zombie, Transform)) {
    // Skip if zombie is dying
    if (DyingZombie.getOrNull(entity)) continue

    const mutableTransform = Transform.getMutable(entity)

    // Calculate direction to player
    const direction = Vector3.create(
      playerPosition.x - mutableTransform.position.x,
      0,
      playerPosition.z - mutableTransform.position.z
    )
    const distance = Vector3.length(direction)

    // Get zombie speed from component
    const zombieSpeed = zombie.speed || baseSpeed

    const animState = AnimationState.getOrNull(entity)
    if (!animState) continue

    if (distance > 1.5) {
      // Side-scrolling movement: zombies move forward (toward player on Z-axis)
      // and slightly adjust X position to track player horizontally
      const normalizedDirection = Vector3.scale(direction, 1 / distance)

      // Prioritize Z-axis movement (forward toward player) - 70% of speed
      // Allow some X-axis tracking (horizontal) - 30% of speed for lane switching
      const forwardSpeed = zombieSpeed * 0.7
      const horizontalSpeed = zombieSpeed * 0.3

      const newPosition = Vector3.create(
        mutableTransform.position.x + normalizedDirection.x * horizontalSpeed * dt,
        mutableTransform.position.y, // Keep at ground level
        mutableTransform.position.z + normalizedDirection.z * forwardSpeed * dt
      )

      mutableTransform.position = newPosition

      // Make zombies face the player fighter
      const angle = Math.atan2(direction.x, direction.z)
      mutableTransform.rotation = Quaternion.fromEulerDegrees(0, angle * (180 / Math.PI), 0)

      // Switch back to movement animation if currently attacking
      if (animState.currentClip === 'attack') {
        const movementClip = animState.nextClip || 'walk'
        const moveAnim = Animator.getClip(entity, movementClip)
        const attackAnim = Animator.getClip(entity, 'attack')

        attackAnim.playing = false
        attackAnim.weight = 0
        moveAnim.playing = true
        moveAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = movementClip
      }
    } else {
      // Switch to attack animation only if not already attacking
      if (animState.currentClip !== 'attack') {
        const movementClip = animState.nextClip || 'walk'
        const attackAnim = Animator.getClip(entity, 'attack')
        const moveAnim = Animator.getClip(entity, movementClip)

        moveAnim.playing = false
        moveAnim.weight = 0
        attackAnim.playing = true
        attackAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = 'attack'
      }

      const lastAttackTime = zombieAttackCooldowns.get(entity) || 0
      const currentTime = Date.now()
      const attackCooldown = 1000 // 1 second between attacks

      if (currentTime - lastAttackTime >= attackCooldown) {
        // Deal damage to player FIGHTER (not avatar)
        // Use getMutable to modify health
        const mutableFighter = PlayerFighter.getMutable(playerFighterEntity)
        mutableFighter.health -= zombie.damage

        console.log(`Zombie ${entity} attacking fighter, health: ${mutableFighter.health}`)

        // Play attack sound - only if this zombie doesn't already have one playing
        if (!activeZombieAttackSounds.has(entity)) {
          const soundEntity = playZombieAttackSound(mutableTransform.position)
          activeZombieAttackSounds.set(entity, soundEntity)
        }

        // Update zombie's last attack time
        zombieAttackCooldowns.set(entity, currentTime)

        // Check for game over
        if (mutableFighter.health <= 0) {
          console.log('Fighter died! Showing game over...')
          showGameOver()
        }
      }
    }
  }
}

/**
 * Dying Zombie System - handles zombie death animations
 */
export function dyingZombieSystem(dt: number) {
  const currentTime = Date.now()
  const deathAnimationDuration = 2000 // 2 seconds

  for (const [entity, dyingZombie] of engine.getEntitiesWith(DyingZombie, Animator)) {
    const animator = Animator.get(entity)
    const dieClip = animator.states.find((state) => state.clip === 'die')

    if (!dieClip) continue

    // Ensure die animation is playing
    if (!dieClip.playing) {
      Animator.playSingleAnimation(entity, 'die', true)
    }

    // Remove zombie after death animation completes
    if (currentTime - dyingZombie.deathStartTime >= deathAnimationDuration) {
      console.log(`Removing zombie ${entity} after die animation`)
      Animator.stopAllAnimations(entity, true)
      engine.removeEntity(entity)
    }
  }
}

/**
 * Clean up zombie sounds when zombie is removed
 */
export function cleanupZombieSounds(entity: Entity) {
  activeZombieAttackSounds.delete(entity)
  zombieAttackCooldowns.delete(entity)
}
