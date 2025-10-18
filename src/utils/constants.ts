/**
 * Game Constants for Neural Collapse
 */

import { Vector3, Quaternion } from '@dcl/sdk/math'

// ============================================
// GAME CONSTANTS
// ============================================

export const GAME_NAME = 'Neural Collapse'

// ============================================
// SPAWN POINTS
// ============================================

export const ZOMBIE_SPAWNS: Vector3[] = [
  Vector3.create(-13.15, 0, -24.43),
  Vector3.create(-9.68, 0, 26.95),
  Vector3.create(45.73, 0, 26.95),
  Vector3.create(47.31, 0, -20.19),
  Vector3.create(5.09, 0, -25.06),
  Vector3.create(31.12, 0, 9.15)
]

export const PLAYER_START_POSITION = Vector3.create(0, 0, 0)

// ============================================
// WEAPON CONSTANTS
// ============================================

export const WEAPON_FPS_POSITION = Vector3.create(0.2, -0.2, 0.4)
export const WEAPON_FPS_SCALE = Vector3.create(0.2, 0.2, 0.2)
export const WEAPON_FPS_ROTATION = Quaternion.fromEulerDegrees(0, 180, 0)
export const WEAPON_RECOIL_AMOUNT = 0.1

export const WEAPON_AMMO = {
  pistol: 999999,
  shotgun: 5,
  rifle: 30,
  maxPistol: 999999,
  maxShotgun: 20,
  maxRifle: 90
}

export const WEAPON_STATS = {
  pistol: {
    damage: 15,
    fireRate: 0.4,
    ammo: 12,
    maxAmmo: 12,
    reloadTime: 1500,
    model: 'models/pistol.glb',
    upgradeModel: 'models/pistol-exe.glb'
  },
  shotgun: {
    damage: 50,
    fireRate: 0.3,
    ammo: 6,
    maxAmmo: 6,
    reloadTime: 2500,
    model: 'models/Shotgun.glb',
    upgradeModel: 'models/shotgun-exe.glb'
  },
  rifle: {
    damage: 20,
    fireRate: 0.15,
    ammo: 25,
    maxAmmo: 25,
    reloadTime: 2000,
    model: 'models/rifle.glb',
    upgradeModel: 'models/rifle-exe.glb'
  }
}

// ============================================
// MACHINE PRICES & POSITIONS
// ============================================

export const WEAPON_MACHINES = {
  shotgun: {
    position: Vector3.create(22.07, 0.88, -19.57),
    rotation: Quaternion.fromEulerDegrees(0, 90, 0),
    weaponPrice: 500,
    ammoPrice: 200,
    ammoAmount: 50,
    model: 'models/weaponMachine/shotgunMachine.glb',
    floatingWeaponModel: 'models/Shotgun.glb',
    floatingPosition: Vector3.create(22.07, 2.38, -19.57)
  },
  rifle: {
    position: Vector3.create(39.01, 0.88, 8.93),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    weaponPrice: 750,
    ammoPrice: 300,
    ammoAmount: 50,
    model: 'models/weaponMachine/rifleMachine.glb',
    floatingWeaponModel: 'models/rifle.glb',
    floatingPosition: Vector3.create(39.01, 2.38, 8.93)
  }
}

export const PERK_MACHINES = {
  doubleTap: {
    position: Vector3.create(38.81, 0.88, -11.25),
    displayPosition: Vector3.create(38.81, 1, -11.25),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    price: 1000,
    model: 'models/perkMachines/doubleTap.glb',
    sound: 'sounds/perkMachines/doubleTap.mp3'
  },
  royalArmor: {
    position: Vector3.create(-0.82, 0.88, -18.95),
    rotation: Quaternion.fromEulerDegrees(0, 270, 0),
    price: 800,
    model: 'models/perkMachines/royalArmorMachine.glb',
    sound: 'sounds/perkMachines/royalArmorMachine.mp3'
  },
  quickReload: {
    position: Vector3.create(-11.4, 0.88, 19.69),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0),
    price: 600,
    model: 'models/perkMachines/quickReload.glb',
    sound: 'sounds/perkMachines/quickReload.mp3'
  },
  executionersChest: {
    position: Vector3.create(21.18, 0.88, 19.16),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    price: 50,
    model: 'models/perkMachines/executionerChest.glb',
    sound: 'sounds/perkMachines/executionerChest.mp3'
  }
}

// ============================================
// ZOMBIE CONSTANTS
// ============================================

export const ZOMBIE_BASE_HEALTH = 50
export const ZOMBIE_HEALTH_MULTIPLIER = 0.5
export const ZOMBIE_BASE_SPEED = 1.0
export const ZOMBIE_SPEED_INCREMENT = 0.1
export const ZOMBIE_BASE_DAMAGE = 10
export const ZOMBIE_DAMAGE_INCREMENT = 2
export const ZOMBIE_SPAWN_INTERVAL = 10000 // 10 seconds
export const ZOMBIE_SPAWN_BATCH_SIZE = 6
export const ZOMBIE_DEATH_ANIMATION_DURATION = 60000 // 60 seconds - bodies stay on floor longer

// Special Zombie: Big Glowing Zombie
export const GLOWING_ZOMBIE_CONFIG = {
  model: 'models/Meshy_Merged_Animations.glb',
  scale: Vector3.create(1.5, 1.5, 1.5), // Bigger than normal zombies
  healthMultiplier: 3.0, // 3x health of normal zombies
  speedMultiplier: 0.8, // 20% slower than normal zombies
  damageMultiplier: 2.0, // 2x damage
  spawnChance: 0.1, // 10% chance to spawn instead of normal zombie
  pointsReward: 300, // Extra points for killing
  // Animation names from Meshy_Merged_Animations.glb
  animations: {
    walk: 'Walking',
    run: 'Running',
    scream: 'Zombie_Scream',
    attack: 'Weapon_Combo_2',
    die: 'Fall_Dead_from_Abdominal_injury'
  }
}

// ============================================
// POWERUP CONSTANTS
// ============================================

export const POWERUP_LIFETIME = 15000
export const POWERUP_SPAWN_FREQUENCY = 2 // Every 2 kills
export const POWERUP_DURATION = 10000

export const POWERUP_MODELS = {
  instantKill: 'models/powerups/instantKill.glb',
  fireRate: 'models/powerups/fireRate.glb',
  maxReload: 'models/powerups/max-ammo.glb',
  doublePoints: 'models/powerups/doublePoints.glb'
}

// ============================================
// SCORE CONSTANTS
// ============================================

export const SCORE_BODY_SHOT = 10
export const SCORE_HEADSHOT = 50
export const SCORE_ZOMBIE_KILL = 100

// ============================================
// SOUND POOL SIZES
// ============================================

export const SOUND_POOL_SIZES = {
  shot: 5,
  shotFail: 3,
  zombieAttack: 3,
  zombieDeath: 3,
  reload: 3,
  shotgunShot: 3,
  weaponSwitch: 3,
  startRound: 3,
  backgroundSiren: 2,
  sale: 3,
  gameOver: 1,
  noPoints: 3,
  perk: 3,
  powerup: 4
}

// ============================================
// CAMERA CONSTANTS
// ============================================

export const CAMERA_AREA_SIZE = Vector3.create(40000, 80, 40000)
export const CAMERA_AREA_POSITION = Vector3.create(8, 1, 8)
