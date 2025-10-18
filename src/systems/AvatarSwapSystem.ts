/**
 * Avatar Swap System for Neural Collapse
 * Replaces the player's default avatar with Alara model
 */

import {
  engine,
  Entity,
  Transform,
  GltfContainer,
  Animator,
  AvatarModifierArea,
  AvatarModifierType
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

let avatarModifierAreaEntity: Entity | null = null
let customAvatarEntity: Entity | null = null
let lastPlayerPosition: Vector3 = Vector3.Zero()
let isMoving: boolean = false
let isAvatarSwapActive: boolean = false

/**
 * Initialize avatar swap - replaces default avatar with Alara
 */
export function enableAvatarSwap(): void {
  if (isAvatarSwapActive) {
    console.log('⚠️ Avatar swap already active')
    return
  }

  console.log('🎭 Enabling Alara avatar...')

  // Step 1: Create area to hide default avatar
  createAvatarModifierArea()

  // Step 2: Create Alara avatar
  createAlaraAvatar()

  // Step 3: Initialize position tracking
  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (playerTransform) {
    lastPlayerPosition = Vector3.clone(playerTransform.position)
  }

  isAvatarSwapActive = true
  console.log('✅ Alara avatar enabled')
}

/**
 * Disable avatar swap and restore default avatar
 */
export function disableAvatarSwap(): void {
  if (!isAvatarSwapActive) {
    console.log('⚠️ Avatar swap not active')
    return
  }

  console.log('🎭 Disabling avatar swap...')

  // Remove modifier area
  if (avatarModifierAreaEntity) {
    engine.removeEntity(avatarModifierAreaEntity)
    avatarModifierAreaEntity = null
  }

  // Remove custom avatar
  if (customAvatarEntity) {
    engine.removeEntity(customAvatarEntity)
    customAvatarEntity = null
  }

  isAvatarSwapActive = false
  console.log('✅ Default avatar restored')
}

/**
 * Create the AvatarModifierArea to hide default player avatar
 */
function createAvatarModifierArea(): void {
  avatarModifierAreaEntity = engine.addEntity()

  AvatarModifierArea.createOrReplace(avatarModifierAreaEntity, {
    area: Vector3.create(200, 50, 200), // Large area covering whole map
    modifiers: [AvatarModifierType.AMT_HIDE_AVATARS],
    excludeIds: [] // Hide all avatars including local player
  })

  Transform.createOrReplace(avatarModifierAreaEntity, {
    position: Vector3.create(0, 0, 0) // World origin
  })

  console.log('✅ Avatar modifier area created')
}

/**
 * Create the Alara avatar entity
 */
function createAlaraAvatar(): void {
  customAvatarEntity = engine.addEntity()

  // Add Alara model
  GltfContainer.createOrReplace(customAvatarEntity, {
    src: 'models/alara.glb',
    invisibleMeshesCollisionMask: 0, // No collisions
    visibleMeshesCollisionMask: 0 // No collisions
  })

  // Parent to PlayerEntity so it follows automatically
  Transform.createOrReplace(customAvatarEntity, {
    position: Vector3.create(0, 0, 0),
    rotation: Quaternion.Identity(),
    scale: Vector3.create(1, 1, 1),
    parent: engine.PlayerEntity
  })

  // Add animator with Alara's animations: Idle, Running, Punch, Kick
  Animator.createOrReplace(customAvatarEntity, {
    states: [
      {
        clip: 'Idle_10',
        playing: true,
        loop: true,
        weight: 1.0
      },
      {
        clip: 'Running',
        playing: false,
        loop: true,
        weight: 1.0
      },
      {
        clip: 'Punch_Combo',
        playing: false,
        loop: false,
        weight: 1.0
      },
      {
        clip: 'Spartan_Kick',
        playing: false,
        loop: false,
        weight: 1.0
      }
    ]
  })

  console.log('✅ Alara avatar created')
}

/**
 * Switch animation based on movement
 */
function switchAnimation(clipName: string): void {
  if (!customAvatarEntity) return

  const animator = Animator.getMutableOrNull(customAvatarEntity)
  if (!animator) return

  // Stop all other animations
  animator.states.forEach((state) => {
    if (state.clip !== clipName) {
      state.playing = false
    }
  })

  // Play requested animation
  const targetState = animator.states.find((state) => state.clip === clipName)
  if (targetState) {
    targetState.playing = true
  }
}

// Animation system - switches between idle and walk based on player movement
let frameCount = 0
const CHECK_INTERVAL = 5 // Check every 5 frames

engine.addSystem((dt: number) => {
  if (!isAvatarSwapActive || !customAvatarEntity) return

  // Throttle checks
  frameCount++
  if (frameCount % CHECK_INTERVAL !== 0) return

  // Get player position
  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const currentPos = playerTransform.position

  // Calculate movement
  const distance = Vector3.distance(currentPos, lastPlayerPosition)
  const movementThreshold = 0.05

  // Switch animation based on movement
  if (distance > movementThreshold) {
    if (!isMoving) {
      switchAnimation('Running')
      isMoving = true
    }
  } else {
    if (isMoving) {
      switchAnimation('Idle_10')
      isMoving = false
    }
  }

  lastPlayerPosition = Vector3.clone(currentPos)
})

// Export debug functions for testing animations
;(globalThis as any).__avatarSwap = {
  enable: enableAvatarSwap,
  disable: disableAvatarSwap,
  isActive: () => isAvatarSwapActive,
  punch: () => switchAnimation('Punch_Combo'),
  kick: () => switchAnimation('Spartan_Kick'),
  idle: () => switchAnimation('Idle_10'),
  run: () => switchAnimation('Running')
}

console.log('🎭 Avatar swap system loaded. Use __avatarSwap.enable() to activate!')
console.log('🥊 Test animations: __avatarSwap.punch(), __avatarSwap.kick(), __avatarSwap.idle(), __avatarSwap.run()')
