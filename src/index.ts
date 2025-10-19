/**
 * Neural Collapse - Main Entry Point
 * A zombie survival horror game for Decentraland
 */

import { engine, Transform, CameraModeArea, CameraType } from '@dcl/sdk/ecs'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

// Core
import { initializeGameState, initializePlayer } from './core/GameState'

// Scene
import { Landscape } from './scene/Landscape'

// Audio
import { initializeSoundPools } from './audio/SoundManager'

// Features
import { initializeWeaponMachines } from './features/WeaponMachineManager'
import { initializePerkMachines } from './features/PerkMachineManager'

// Systems
import { zombieSystem, dyingZombieSystem } from './systems/ZombieSystem'
import { shootingSystem, weaponRecoilSystem, weaponSwitchSystem, weaponReloadSystem } from './systems/WeaponSystem'
import { raycastResultSystem, scoreIndicatorSystem } from './systems/RaycastSystem'
import { powerUpSystem } from './systems/PowerUpSystem'
import { weaponMachineSystem, perkMachineSystem } from './systems/MachineSystem'
import { animationSystem } from './systems/AnimationSystem'
import { waveSpawnSystem } from './systems/WaveSpawnSystem'
import { gameStateSystem } from './systems/GameStateSystem'
import { backgroundSirenSoundSystem, backgroundMusicSystem } from './systems/BackgroundSoundSystem'
import { muzzleFlashSystem, bloodEffectSystem } from './systems/VisualEffectsSystem'

// UI
import { StartMenu } from './ui/GameUI.js'
import { startIntroCutscene } from './ui/CutsceneManager'
import { updateEntryCutsceneFade } from './ui/EntryCutscene'

// Constants
import { CAMERA_AREA_SIZE, CAMERA_AREA_POSITION, PLAYER_START_POSITION } from './utils/constants'

/**
 * Main initialization function
 */
export function main() {
  console.log('Initializing Neural Collapse...')

  // Initialize game state
  initializeGameState()
  initializePlayer()

  // Initialize landscape (buildings, walls, floor, props)
  console.log('Creating landscape...')
  new Landscape()

  // Create camera mode area for first-person view
  const cameraModeArea = engine.addEntity()
  Transform.createOrReplace(cameraModeArea, {
    position: CAMERA_AREA_POSITION,
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })
  CameraModeArea.createOrReplace(cameraModeArea, {
    area: CAMERA_AREA_SIZE,
    mode: CameraType.CT_FIRST_PERSON
  })
  console.log('Camera mode area created')

  // Position player at starting location
  Transform.createOrReplace(engine.PlayerEntity, {
    position: PLAYER_START_POSITION
  })
  console.log('Player positioned')

  // Initialize weapon machines
  initializeWeaponMachines()

  // Initialize perk machines
  initializePerkMachines()

  // Initialize sound pools
  initializeSoundPools()

  // Register all game systems
  console.log('Registering game systems...')

  // Core gameplay systems
  engine.addSystem(shootingSystem)
  engine.addSystem(raycastResultSystem)
  engine.addSystem(zombieSystem)
  engine.addSystem(dyingZombieSystem)
  engine.addSystem(waveSpawnSystem)

  // Weapon systems
  engine.addSystem(weaponRecoilSystem)
  engine.addSystem(weaponSwitchSystem)
  engine.addSystem(weaponReloadSystem)

  // Machine interaction systems
  engine.addSystem(weaponMachineSystem)
  engine.addSystem(perkMachineSystem)

  // Power-up and effects systems
  engine.addSystem(powerUpSystem)
  engine.addSystem(animationSystem)

  // Visual effects systems
  engine.addSystem(muzzleFlashSystem)
  engine.addSystem(bloodEffectSystem)

  // UI and game state systems
  engine.addSystem(gameStateSystem)
  engine.addSystem(scoreIndicatorSystem)

  // Background ambient sounds and music
  engine.addSystem(backgroundMusicSystem)
  engine.addSystem(backgroundSirenSoundSystem)

  // Cutscene fade system
  engine.addSystem(updateEntryCutsceneFade)

  console.log('All systems registered')

  // Setup UI - start with intro cutscene
  startIntroCutscene()
  console.log('UI initialized with intro cutscene')

  console.log('Neural Collapse initialization complete!')
}

// Start the game
main()
