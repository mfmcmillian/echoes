/**
 * Fighter Weapon System
 * Handles automatic shooting for the player fighter (Last War style)
 */

import { engine, Transform, Material, MeshRenderer, Entity, Schemas, Animator } from '@dcl/sdk/ecs'
import { Vector3, Color4, Quaternion } from '@dcl/sdk/math'
import { PlayerFighter } from './PlayerFighterSystem'
import { Zombie, Health, DyingZombie, AnimationState, GameState } from '../components/GameComponents'
import { playSound } from '../audio/SoundManager'
import { getGamePhase, isPaused, gameStateEntity } from '../core/GameState'
import { AllyZombie } from './AllyZombieSystem'

// Weapon stats for starting weapon (basic pistol-like)
const FIRE_RATE = 0.5 // Seconds between shots
const PROJECTILE_SPEED = 25 // Units per second
const PROJECTILE_RANGE = 15 // Max distance projectiles can travel
const PROJECTILE_DAMAGE = 15 // Damage per hit

// Component for projectiles
export const Projectile = engine.defineComponent('fighter::projectile', {
  velocity: Schemas.Vector3,
  distanceTraveled: Schemas.Number,
  maxRange: Schemas.Number,
  damage: Schemas.Number
})

let lastFireTime = 0
let projectileEntities: Entity[] = []
let allyLastFireTimes = new Map<Entity, number>() // Track fire times per ally

/**
 * Auto-fire system - shoots automatically (player + allies)
 */
export function fighterAutoFireSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const currentTime = Date.now() / 1000 // Convert to seconds

  // Player shooting
  if (currentTime - lastFireTime >= FIRE_RATE) {
    // Find the player fighter
    for (const [entity] of engine.getEntitiesWith(PlayerFighter, Transform)) {
      const transform = Transform.get(entity)
      fireProjectile(transform.position)
      lastFireTime = currentTime

      // Play very quiet shot sound
      playSound('shot')
      break
    }
  }

  // Ally shooting
  for (const [entity] of engine.getEntitiesWith(AllyZombie, Transform)) {
    const lastFire = allyLastFireTimes.get(entity) || 0

    if (currentTime - lastFire >= FIRE_RATE) {
      const transform = Transform.get(entity)
      fireProjectile(transform.position)
      allyLastFireTimes.set(entity, currentTime)

      // Play very quiet shot sound
      playSound('shot')
    }
  }
}

/**
 * Create and fire a projectile
 */
function fireProjectile(startPosition: Vector3): void {
  const projectile = engine.addEntity()

  // Position slightly in front of player fighter
  const spawnPos = Vector3.create(
    startPosition.x + 1, // Start 1 unit forward
    startPosition.y + 1, // At chest height
    startPosition.z
  )

  Transform.create(projectile, {
    position: spawnPos,
    scale: Vector3.create(0.3, 0.3, 0.8), // Elongated energy blast
    rotation: Quaternion.fromEulerDegrees(0, 90, 0) // Point forward (toward +X)
  })

  // Create energy blast visual (cyan/blue glow)
  MeshRenderer.setBox(projectile)
  Material.setPbrMaterial(projectile, {
    albedoColor: Color4.create(0.2, 0.8, 1, 0.8), // Bright cyan, semi-transparent
    emissiveColor: Color4.create(0.2, 0.8, 1), // Glowing cyan
    emissiveIntensity: 2
  })

  // Add projectile component
  Projectile.create(projectile, {
    velocity: { x: PROJECTILE_SPEED, y: 0, z: 0 }, // Move forward (toward +X)
    distanceTraveled: 0,
    maxRange: PROJECTILE_RANGE,
    damage: PROJECTILE_DAMAGE
  })

  projectileEntities.push(projectile)
  console.log(`🔫 Fired projectile from (${spawnPos.x}, ${spawnPos.y}, ${spawnPos.z})`)
}

/**
 * Update projectile movement and collision
 */
export function projectileUpdateSystem(dt: number): void {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  for (const [entity] of engine.getEntitiesWith(Projectile, Transform)) {
    const projectile = Projectile.getMutable(entity)
    const transform = Transform.getMutable(entity)

    // Move projectile
    const movement = Vector3.create(projectile.velocity.x * dt, projectile.velocity.y * dt, projectile.velocity.z * dt)

    transform.position = Vector3.create(
      transform.position.x + movement.x,
      transform.position.y + movement.y,
      transform.position.z + movement.z
    )

    // Update distance traveled
    const distanceMoved = Math.sqrt(movement.x * movement.x + movement.y * movement.y + movement.z * movement.z)
    projectile.distanceTraveled += distanceMoved

    // Check if projectile exceeded range
    if (projectile.distanceTraveled >= projectile.maxRange) {
      engine.removeEntity(entity)
      projectileEntities = projectileEntities.filter((e) => e !== entity)
      continue
    }

    // Check collision with zombies
    let hitZombie = false
    for (const [zombieEntity] of engine.getEntitiesWith(Zombie, Transform)) {
      const zombieTransform = Transform.get(zombieEntity)
      const distance = Vector3.distance(transform.position, zombieTransform.position)

      // Simple sphere collision (within 1.5 units)
      if (distance < 1.5) {
        // Damage zombie
        const zombieHealth = Health.getMutable(zombieEntity)
        zombieHealth.current -= projectile.damage

        console.log(`💥 Hit zombie! Health: ${zombieHealth.current}/${zombieHealth.max}`)

        // Play headshot sound
        playSound('thunk')

        // Check if zombie died
        if (zombieHealth.current <= 0 && !DyingZombie.getOrNull(zombieEntity)) {
          handleZombieDeath(zombieEntity, zombieTransform.position)
        }

        // Remove projectile
        engine.removeEntity(entity)
        projectileEntities = projectileEntities.filter((e) => e !== entity)
        hitZombie = true
        break
      }
    }

    if (hitZombie) break
  }
}

/**
 * Reset weapon system
 */
export function resetFighterWeapon(): void {
  lastFireTime = 0

  // Remove all projectiles
  for (const entity of projectileEntities) {
    engine.removeEntity(entity)
  }
  projectileEntities = []
}

/**
 * Handle zombie death
 */
function handleZombieDeath(zombieEntity: Entity, position: Vector3): void {
  const gameState = GameState.getMutable(gameStateEntity)
  gameState.zombiesRemaining -= 1
  gameState.kills += 1

  console.log(`💀 Zombie killed! Remaining: ${gameState.zombiesRemaining}`)

  // Play death sound using zombie death sound function
  playSound('die')

  // Play death animation using Animator.playSingleAnimation
  const animator = Animator.getOrNull(zombieEntity)
  if (animator) {
    Animator.stopAllAnimations(zombieEntity, false)
    Animator.playSingleAnimation(zombieEntity, 'die', true)

    const animState = AnimationState.getMutableOrNull(zombieEntity)
    if (animState) {
      animState.currentClip = 'die'
      animState.nextClip = ''
    }
  }

  // Mark zombie as dying
  DyingZombie.create(zombieEntity, {
    deathStartTime: Date.now()
  })
}
