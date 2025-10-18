/**
 * PowerUp System for Neural Collapse
 * Handles power-up collection and effects
 */

import { engine, Transform, Animator } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { PowerUp, PlayerBuffs, Zombie, Weapon, Player, DyingZombie, AnimationState } from '../components/GameComponents'
import { gameStateEntity, getGamePhase, isPaused, playerEntity, weaponAmmo, addScore } from '../core/GameState'
import { GameState } from '../components/GameComponents'
import { playSound, playZombieDeathSound } from '../audio/SoundManager'
import { spawnNextWave, checkWaveCompletion } from '../features/WaveManager'
import { cleanupZombieSounds } from './ZombieSystem'
import { SCORE_ZOMBIE_KILL } from '../utils/constants'

/**
 * PowerUp System - handles collection and effects
 */
export function powerUpSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  const playerTransform = Transform.getOrNull(engine.PlayerEntity)
  if (!playerTransform) return

  const playerPosition = playerTransform.position
  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  if (!playerBuffs) return

  const currentTime = Date.now()

  // Check for expired buffs
  const mutableBuffs = PlayerBuffs.getMutable(engine.PlayerEntity)
  if (currentTime >= playerBuffs.fireRateExpiry) {
    mutableBuffs.fireRateMultiplier = 1
  }
  if (currentTime >= playerBuffs.pointsExpiry) {
    mutableBuffs.pointsMultiplier = 1
  }

  // Check for power-up collection
  for (const [entity, powerUp] of engine.getEntitiesWith(PowerUp)) {
    if (!powerUp.active) continue

    const powerUpTransform = Transform.getOrNull(entity)
    if (!powerUpTransform) continue

    // Check if power-up lifetime has expired
    const timeElapsed = currentTime - powerUp.spawnTime
    if (timeElapsed >= powerUp.lifetime) {
      engine.removeEntity(entity)
      continue
    }

    // Blink effect during last 8 seconds
    if (timeElapsed >= powerUp.lifetime - 8000) {
      const blinkInterval = timeElapsed >= powerUp.lifetime - 3000 ? 125 : 250
      const shouldShow = Math.floor(timeElapsed / blinkInterval) % 2 === 0
      const transform = Transform.getMutable(entity)
      if (shouldShow) {
        transform.scale = Vector3.create(0.5, 0.5, 0.5)
      } else {
        transform.scale = Vector3.create(0, 0, 0)
      }
    }

    // Check for collection
    const distance = Vector3.distance(playerPosition, powerUpTransform.position)
    if (distance < 1.5) {
      applyPowerUpEffect(powerUp.type, powerUp.duration, powerUp.value, mutableBuffs)

      // Play power-up sound
      const soundPath =
        powerUp.type === 'maxReload'
          ? 'sounds/powerups/max-ammo.mp3'
          : powerUp.type === 'doublePoints'
          ? 'sounds/powerups/double-points.mp3'
          : `sounds/powerups/${powerUp.type}.mp3`

      playSound('powerup', soundPath)

      // Remove power-up
      PowerUp.getMutable(entity).active = false
      engine.removeEntity(entity)
    }
  }
}

/**
 * Apply power-up effect
 */
function applyPowerUpEffect(type: string, duration: number, value: number, playerBuffs: any) {
  const currentTime = Date.now()

  switch (type) {
    case 'instantKill':
      // Kill all zombies with proper death animations
      const gameState = GameState.getMutable(gameStateEntity)

      for (const [zombieEntity, zombie, transform] of engine.getEntitiesWith(Zombie, Transform)) {
        // Skip if already dying
        if (DyingZombie.getOrNull(zombieEntity)) continue

        addScore(SCORE_ZOMBIE_KILL)
        gameState.zombiesRemaining -= 1
        gameState.kills += 1

        console.log(`Instant kill zombie ${zombieEntity}! Zombies remaining: ${gameState.zombiesRemaining}`)

        // Play death sound at zombie's position
        playZombieDeathSound(transform.position)

        // Clean up zombie sounds
        cleanupZombieSounds(zombieEntity)

        // Play death animation
        const animator = Animator.getOrNull(zombieEntity)
        if (animator) {
          Animator.stopAllAnimations(zombieEntity, false)

          const walkClip = Animator.getClip(zombieEntity, 'walk')
          const runClip = Animator.getClip(zombieEntity, 'run')
          const dieClip = Animator.getClip(zombieEntity, 'die')

          if (walkClip) walkClip.weight = 0
          if (runClip) runClip.weight = 0
          if (dieClip) {
            dieClip.weight = 1
            dieClip.playing = true
          }

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

      // Check if wave is complete
      checkWaveCompletion()
      break

    case 'fireRate':
      playerBuffs.fireRateMultiplier = value
      playerBuffs.fireRateExpiry = currentTime + duration
      break

    case 'maxReload':
      // Refill all weapons
      const player = Player.getOrNull(playerEntity)
      if (player) {
        for (const weapon of player.weapons) {
          const weaponComponent = Weapon.getOrNull(weapon)
          if (weaponComponent) {
            const mutableWeapon = Weapon.getMutable(weapon)
            mutableWeapon.ammo = mutableWeapon.maxAmmo
            mutableWeapon.storedAmmo = mutableWeapon.maxAmmo

            // Update global ammo state
            switch (weaponComponent.type) {
              case 'pistol':
                weaponAmmo.pistol = weaponAmmo.maxPistol
                break
              case 'shotgun':
                weaponAmmo.shotgun = weaponAmmo.maxShotgun
                break
              case 'rifle':
                weaponAmmo.rifle = weaponAmmo.maxRifle
                break
            }
          }
        }
      }
      break

    case 'doublePoints':
      playerBuffs.pointsMultiplier = value
      playerBuffs.pointsExpiry = currentTime + duration
      break
  }
}
