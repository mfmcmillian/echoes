/**
 * Zombie Factory for Neural Collapse
 * Creates and manages zombie entities
 */

import { engine, Entity, Transform, GltfContainer, Animator, MeshCollider, Material } from '@dcl/sdk/ecs'
import { Vector3, Color4 } from '@dcl/sdk/math'
import { Zombie, Health, AnimationState, GlowingZombie } from '../components/GameComponents'
import { GameState } from '../components/GameComponents'
import { gameStateEntity } from '../core/GameState'
import { ZombieType } from '../utils/types'
import {
  ZOMBIE_BASE_HEALTH,
  ZOMBIE_HEALTH_MULTIPLIER,
  ZOMBIE_BASE_SPEED,
  ZOMBIE_SPEED_INCREMENT,
  ZOMBIE_BASE_DAMAGE,
  ZOMBIE_DAMAGE_INCREMENT,
  GLOWING_ZOMBIE_CONFIG
} from '../utils/constants'

/**
 * Create a zombie entity with optional type
 */
export function createZombie(position: Vector3, type: ZombieType = 'normal'): Entity {
  // Randomly spawn glowing zombie based on chance
  if (type === 'normal' && Math.random() < GLOWING_ZOMBIE_CONFIG.spawnChance) {
    return createGlowingZombie(position)
  }

  const entity = engine.addEntity()

  // Create the main zombie entity with GLTF model
  Transform.create(entity, {
    position,
    scale: Vector3.create(1, 1, 1)
  })

  // Add the GLTF model
  GltfContainer.create(entity, {
    src: 'models/zombie.glb'
  })

  // Add collision to the zombie - cylinder with 1 unit radius (better for characters)
  MeshCollider.setCylinder(entity, 1, 1) // radiusBottom, radiusTop (height is automatic)

  // Get current wave for health/damage scaling
  const gameState = GameState.get(gameStateEntity)
  const currentWave = gameState.currentWave

  // Calculate scaled stats
  const healthMultiplier = 1 + (currentWave - 1) * ZOMBIE_HEALTH_MULTIPLIER
  const maxHealth = Math.floor(ZOMBIE_BASE_HEALTH * healthMultiplier)
  const speed = ZOMBIE_BASE_SPEED + currentWave * ZOMBIE_SPEED_INCREMENT
  const damage = ZOMBIE_BASE_DAMAGE + currentWave * ZOMBIE_DAMAGE_INCREMENT

  // Add components for zombie behavior
  Zombie.create(entity, {
    health: maxHealth,
    speed,
    damage,
    target: engine.PlayerEntity
  })

  Health.create(entity, {
    current: maxHealth,
    max: maxHealth,
    lastDamageTime: 0
  })

  // Randomly choose between walk and run animation (50/50)
  const movementClip = Math.random() > 0.5 ? 'Running' : 'Walking'
  const movementSpeed = movementClip === 'Running' ? speed * 1.5 : speed

  // Add Animator component for animations
  Animator.create(entity, {
    states: [
      { clip: 'Walking', playing: movementClip === 'Walking', loop: true, weight: movementClip === 'Walking' ? 1 : 0 },
      { clip: 'Running', playing: movementClip === 'Running', loop: true, weight: movementClip === 'Running' ? 1 : 0 },
      { clip: 'Weapon_Combo_2', playing: false, loop: true, weight: 0 },
      { clip: 'Fall_Dead_from_Abdominal_injury', playing: false, loop: false, weight: 0 }
    ]
  })

  // Add AnimationState component to track current and base movement animation
  AnimationState.create(entity, {
    currentClip: movementClip,
    nextClip: movementClip, // Store base movement animation (walk or run)
    attackClip: 'Weapon_Combo_2',
    dieClip: 'Fall_Dead_from_Abdominal_injury'
  })

  // Update zombie speed if running
  if (movementClip === 'Running') {
    Zombie.getMutable(entity).speed = movementSpeed
  }

  console.log(`Created zombie ${entity} with ${maxHealth} health at wave ${currentWave}`)
  return entity
}

/**
 * Create a special glowing zombie with enhanced stats
 */
export function createGlowingZombie(position: Vector3): Entity {
  const entity = engine.addEntity()

  // Create the glowing zombie with custom model and scale
  Transform.create(entity, {
    position,
    scale: GLOWING_ZOMBIE_CONFIG.scale
  })

  // Add the custom GLTF model
  GltfContainer.create(entity, {
    src: GLOWING_ZOMBIE_CONFIG.model
  })

  // Add collision (bigger cylinder for bigger zombie - 1.5x radius to match scale)
  MeshCollider.setCylinder(entity, 1.5, 1.5) // radiusBottom, radiusTop (height is automatic)

  // Get current wave for health/damage scaling
  const gameState = GameState.get(gameStateEntity)
  const currentWave = gameState.currentWave

  // Calculate scaled stats with glowing zombie multipliers
  const healthMultiplier = (1 + (currentWave - 1) * ZOMBIE_HEALTH_MULTIPLIER) * GLOWING_ZOMBIE_CONFIG.healthMultiplier
  const maxHealth = Math.floor(ZOMBIE_BASE_HEALTH * healthMultiplier)
  const speed = (ZOMBIE_BASE_SPEED + currentWave * ZOMBIE_SPEED_INCREMENT) * GLOWING_ZOMBIE_CONFIG.speedMultiplier
  const damage = (ZOMBIE_BASE_DAMAGE + currentWave * ZOMBIE_DAMAGE_INCREMENT) * GLOWING_ZOMBIE_CONFIG.damageMultiplier

  // Add components for zombie behavior
  Zombie.create(entity, {
    health: maxHealth,
    speed,
    damage,
    target: engine.PlayerEntity
  })

  Health.create(entity, {
    current: maxHealth,
    max: maxHealth,
    lastDamageTime: 0
  })

  // Get animation names from config
  const anims = GLOWING_ZOMBIE_CONFIG.animations

  // Start with WALK animation only (will run after scream)
  const movementClip = anims.walk
  const movementSpeed = speed

  // Add Animator component with custom animation names
  Animator.create(entity, {
    states: [
      {
        clip: anims.walk,
        playing: movementClip === anims.walk,
        loop: true,
        weight: movementClip === anims.walk ? 1 : 0
      },
      { clip: anims.run, playing: movementClip === anims.run, loop: true, weight: movementClip === anims.run ? 1 : 0 },
      { clip: anims.scream, playing: false, loop: false, weight: 0 }, // Scream animation (can be triggered on spawn)
      { clip: anims.attack, playing: false, loop: true, weight: 0 },
      { clip: anims.die, playing: false, loop: false, weight: 0 }
    ]
  })

  // Add AnimationState component
  AnimationState.create(entity, {
    currentClip: movementClip,
    nextClip: movementClip,
    attackClip: anims.attack,
    dieClip: anims.die
  })

  // Add GlowingZombie component to track trigger state
  GlowingZombie.create(entity, {
    triggered: false,
    screamStartTime: 0,
    triggerDistance: 10 // Scream when player within 10 units
  })

  console.log(`🟢 Created GLOWING zombie ${entity} with ${maxHealth} health at wave ${currentWave}`)
  return entity
}

/**
 * Remove all zombies from the scene
 */
export function removeAllZombies() {
  for (const [entity] of engine.getEntitiesWith(Zombie)) {
    engine.removeEntity(entity)
  }
  console.log('Removed all zombies')
}
