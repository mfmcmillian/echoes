/**
 * Zombie AI System for Neural Collapse
 * Handles zombie movement, pathfinding, and attacks
 */

import { engine, Transform, Animator, Entity } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { Zombie, Health, DyingZombie, GameState, AnimationState, GlowingZombie } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused } from '../core/GameState'
import { playZombieAttackSound } from '../audio/SoundManager'
import { showGameOver } from '../core/GameController'

// Track zombie attack cooldowns and active sounds
const zombieAttackCooldowns = new Map<number, number>()
const activeZombieAttackSounds = new Map<number, number>()

/**
 * Zombie AI System - handles movement and attacks
 */
export function zombieSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const playerPosition = playerTransform.position
  const playerHealth = Health.getMutableOrNull(engine.PlayerEntity) // May be null for avatar testing

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

    // Handle Glowing Zombie special behavior (scream then run)
    const glowingZombie = GlowingZombie.getMutableOrNull(entity)
    if (glowingZombie) {
      handleGlowingZombieBehavior(entity, glowingZombie, animState, distance)
    }

    if (distance > 1.5) {
      // Movement logic
      const normalizedDirection = Vector3.scale(direction, 1 / distance)
      const newPosition = Vector3.add(mutableTransform.position, Vector3.scale(normalizedDirection, zombieSpeed * dt))

      mutableTransform.position = newPosition
      mutableTransform.rotation = Quaternion.lookRotation(normalizedDirection, Vector3.Up())

      // Switch back to movement animation if currently attacking
      const attackClipName = animState.attackClip || 'attack'
      if (animState.currentClip === attackClipName) {
        const movementClip = animState.nextClip || 'walk'
        const moveAnim = Animator.getClip(entity, movementClip)
        const attackAnim = Animator.getClip(entity, attackClipName)

        attackAnim.playing = false
        attackAnim.weight = 0
        moveAnim.playing = true
        moveAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = movementClip
      }
    } else {
      // Switch to attack animation only if not already attacking
      const attackClipName = animState.attackClip || 'attack'
      if (animState.currentClip !== attackClipName) {
        const movementClip = animState.nextClip || 'walk'
        const attackAnim = Animator.getClip(entity, attackClipName)
        const moveAnim = Animator.getClip(entity, movementClip)

        moveAnim.playing = false
        moveAnim.weight = 0
        attackAnim.playing = true
        attackAnim.weight = 1

        AnimationState.getMutable(entity).currentClip = attackClipName
      }

      const lastAttackTime = zombieAttackCooldowns.get(entity) || 0
      const currentTime = Date.now()
      const attackCooldown = 1000 // 1 second between attacks

      if (currentTime - lastAttackTime >= attackCooldown) {
        // Deal damage to player (only if health exists)
        if (playerHealth) {
          playerHealth.current -= zombie.damage
          playerHealth.lastDamageTime = currentTime
          console.log(`Zombie ${entity} attacking, player health: ${playerHealth.current}`)

          // Check for game over
          if (playerHealth.current <= 0) {
            console.log('Player died! Showing game over...')
            showGameOver()
          }
        }

        // Play attack sound - only if this zombie doesn't already have one playing
        if (!activeZombieAttackSounds.has(entity)) {
          const soundEntity = playZombieAttackSound(mutableTransform.position)
          activeZombieAttackSounds.set(entity, soundEntity)
          console.log(`Playing attack sound for zombie ${entity}`)
        }

        // Update zombie's last attack time
        zombieAttackCooldowns.set(entity, currentTime)
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
    const dieClip = animator.states.find((state) => state.clip === 'Fall_Dead_from_Abdominal_injury')

    if (!dieClip) continue

    // Ensure die animation is playing
    if (!dieClip.playing) {
      Animator.playSingleAnimation(entity, 'Fall_Dead_from_Abdominal_injury', true)
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
 * Handle glowing zombie special behavior: scream when player gets close, then run
 */
function handleGlowingZombieBehavior(
  entity: Entity,
  glowingZombie: ReturnType<typeof GlowingZombie.getMutable>,
  animState: ReturnType<typeof AnimationState.get>,
  distanceToPlayer: number
) {
  const currentTime = Date.now()
  const screamDuration = 2000 // 2 seconds for scream animation

  // Check if player is within trigger distance and zombie hasn't been triggered yet
  if (!glowingZombie.triggered && distanceToPlayer <= glowingZombie.triggerDistance) {
    // TRIGGER: Start scream animation
    console.log(`🟢 Glowing zombie ${entity} triggered! Playing scream animation...`)

    const animator = Animator.getMutableOrNull(entity)
    if (animator) {
      // Stop current movement animation
      const currentClip = Animator.getClip(entity, animState.currentClip)
      currentClip.playing = false
      currentClip.weight = 0

      // Play scream animation
      const screamClip = Animator.getClip(entity, 'Zombie_Scream')
      screamClip.playing = true
      screamClip.weight = 1

      AnimationState.getMutable(entity).currentClip = 'Zombie_Scream'
    }

    glowingZombie.triggered = true
    glowingZombie.screamStartTime = currentTime
    return // Don't move during scream trigger frame
  }

  // Check if zombie is currently screaming
  if (glowingZombie.triggered && currentTime - glowingZombie.screamStartTime < screamDuration) {
    // Still screaming, don't move yet
    return
  }

  // After scream, switch to running
  if (glowingZombie.triggered && animState.currentClip === 'Zombie_Scream') {
    console.log(`🟢 Glowing zombie ${entity} finished screaming, now RUNNING!`)

    const animator = Animator.getMutableOrNull(entity)
    if (animator) {
      // Stop scream animation
      const screamClip = Animator.getClip(entity, 'Zombie_Scream')
      screamClip.playing = false
      screamClip.weight = 0

      // Start running animation
      const runClip = Animator.getClip(entity, 'Running')
      runClip.playing = true
      runClip.weight = 1

      AnimationState.getMutable(entity).currentClip = 'Running'
      AnimationState.getMutable(entity).nextClip = 'Running'
    }

    // Increase speed to running speed
    const zombie = Zombie.getMutable(entity)
    zombie.speed = zombie.speed * 3 // Triple speed after scream - FAST!
  }
}

/**
 * Clean up zombie sounds when zombie is removed
 */
export function cleanupZombieSounds(entity: Entity) {
  activeZombieAttackSounds.delete(entity)
  zombieAttackCooldowns.delete(entity)
}
