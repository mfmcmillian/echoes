/**
 * Game UI for Neural Collapse
 * Main game interface with modern design
 */

import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { engine, Transform, AudioSource } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import {
  GameState,
  Health,
  Player,
  Weapon,
  PlayerBuffs,
  WeaponMachine,
  DoubleTapMachine,
  RoyalArmorMachine,
  QuickReloadMachine,
  ExecutionersChestMachine
} from '../components/GameComponents'
import { shotgunMachineEntity, rifleMachineEntity } from '../features/WeaponMachineManager'
import {
  doubleTapMachineEntity,
  royalArmorMachineEntity,
  quickReloadMachineEntity,
  executionersChestMachineEntity
} from '../features/PerkMachineManager'
import { HealthBar } from './components/HealthBar'
import { InteractionPrompt } from './components/InteractionPrompt'
import { Card } from './components/Card'
import { Button } from './components/Button'
import { Badge } from './components/Badge'
import { UITheme } from './UITheme'
import { gameStateEntity } from '../core/GameState'
import { pauseSoundEntity } from '../audio/SoundManager'
import { GAME_NAME } from '../utils/constants'
import { getTotalZombieCount, getAllyCount } from '../systems/AllyZombieSystem'
import { STORY_WAVES } from '../utils/storyConfig'
import { getFadeOverlay } from '../systems/WaveDialogueManager'

/**
 * Start Menu UI - Modern design with glass-morphism
 */
export const StartMenu = () => {
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{
        color: UITheme.colors.overlayDark
      }}
    >
      {/* Main menu card */}
      <UiEntity
        uiTransform={{
          width: 600,
          height: 'auto',
          padding: UITheme.spacing.xxl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        uiBackground={{
          color: UITheme.colors.glass
        }}
      >
        {/* Top accent border */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 3,
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: UITheme.colors.accent
          }}
        />
        
        {/* Glow effect */}
        <UiEntity
          uiTransform={{
            width: '102%',
            height: '102%',
            positionType: 'absolute',
            position: { top: -4, left: -4 }
          }}
          uiBackground={{
            color: UITheme.colors.accentGlow
          }}
        />
        
        {/* Title with styling */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.xl },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Label 
            value={GAME_NAME} 
            fontSize={UITheme.fontSize.hero} 
            color={UITheme.colors.text} 
            textAlign="middle-center"
            uiTransform={{
              margin: { bottom: UITheme.spacing.small }
            }}
          />
          <Label 
            value="— SURVIVAL MODE —" 
            fontSize={UITheme.fontSize.medium} 
            color={UITheme.colors.textSecondary} 
            textAlign="middle-center"
          />
        </UiEntity>
        
        {/* Start button */}
        <UiEntity
          uiTransform={{
            width: 400,
            height: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.primaryLight
          }}
        >
          {/* Button glow */}
          <UiEntity
            uiTransform={{
              width: '102%',
              height: '102%',
              positionType: 'absolute',
              position: { top: -2, left: -2 }
            }}
            uiBackground={{
              color: UITheme.colors.accentGlow
            }}
          />
          
          {/* Button accent borders */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 3,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.accent
            }}
          />
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 3,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.accent
            }}
          />
          
          <Label
            value="► PRESS E TO START"
            fontSize={UITheme.fontSize.xlarge}
            color={UITheme.colors.text}
            textAlign="middle-center"
          />
        </UiEntity>
        
        {/* Info text */}
        <Label
          value="Survive waves of enemies and upgrade your arsenal"
          fontSize={UITheme.fontSize.base}
          color={UITheme.colors.textMuted}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Game Over Menu UI - Modern design with stats display
 */
export const GameOverMenu = () => {
  const gameStateEntities = Array.from(engine.getEntitiesWith(GameState))
  const gameState = gameStateEntities.length > 0 ? GameState.getOrNull(gameStateEntities[0][0]) : null
  const score = gameState ? gameState.score : 0
  const wave = gameState ? gameState.currentWave : 0
  const kills = gameState ? gameState.kills : 0
  const headshots = gameState ? gameState.headshots : 0
  const headshotPercent = kills > 0 ? Math.floor((headshots / kills) * 100) : 0

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      uiBackground={{
        color: UITheme.colors.overlayDark
      }}
    >
      {/* Game Over card */}
      <UiEntity
        uiTransform={{
          width: 700,
          height: 'auto',
          padding: UITheme.spacing.xxl,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
        uiBackground={{
          color: UITheme.colors.glass
        }}
      >
        {/* Top accent border */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 3,
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: UITheme.colors.danger
          }}
        />
        
        {/* Danger glow */}
        <UiEntity
          uiTransform={{
            width: '102%',
            height: '102%',
            positionType: 'absolute',
            position: { top: -4, left: -4 }
          }}
          uiBackground={{
            color: UITheme.colors.dangerGlow
          }}
        />
        
        {/* Game Over title */}
        <Label 
          value="GAME OVER" 
          fontSize={UITheme.fontSize.hero} 
          color={UITheme.colors.danger} 
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: UITheme.spacing.xl }
          }}
        />
        
        {/* Stats container */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            padding: UITheme.spacing.large,
            margin: { bottom: UITheme.spacing.xl },
            display: 'flex',
            flexDirection: 'column'
          }}
          uiBackground={{
            color: UITheme.colors.primaryDark
          }}
        >
          {/* Header */}
          <Label 
            value="FINAL STATISTICS" 
            fontSize={UITheme.fontSize.medium} 
            color={UITheme.colors.textSecondary} 
            textAlign="middle-center"
            uiTransform={{
              margin: { bottom: UITheme.spacing.medium }
            }}
          />
          
          {/* Score */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              padding: UITheme.spacing.medium,
              margin: { bottom: UITheme.spacing.small },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            uiBackground={{
              color: Color4.create(0, 0, 0, 0.3)
            }}
          >
            {/* Left accent */}
            <UiEntity
              uiTransform={{
                width: 3,
                height: '100%',
                positionType: 'absolute',
                position: { left: 0, top: 0 }
              }}
              uiBackground={{
                color: UITheme.colors.gold
              }}
            />
            
            <Label 
              value="⭐ FINAL SCORE" 
              fontSize={UITheme.fontSize.large} 
              color={UITheme.colors.text} 
              textAlign="middle-left"
            />
            <Label 
              value={`${score}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.gold} 
              textAlign="middle-right"
            />
          </UiEntity>
          
          {/* Wave */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              padding: UITheme.spacing.medium,
              margin: { bottom: UITheme.spacing.small },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            uiBackground={{
              color: Color4.create(0, 0, 0, 0.3)
            }}
          >
            {/* Left accent */}
            <UiEntity
              uiTransform={{
                width: 3,
                height: '100%',
                positionType: 'absolute',
                position: { left: 0, top: 0 }
              }}
              uiBackground={{
                color: UITheme.colors.accent
              }}
            />
            
            <Label 
              value="≈ WAVE REACHED" 
              fontSize={UITheme.fontSize.large} 
              color={UITheme.colors.text} 
              textAlign="middle-left"
            />
            <Label 
              value={`${wave}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.accent} 
              textAlign="middle-right"
            />
          </UiEntity>
          
          {/* Kills */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              padding: UITheme.spacing.medium,
              margin: { bottom: UITheme.spacing.small },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            uiBackground={{
              color: Color4.create(0, 0, 0, 0.3)
            }}
          >
            {/* Left accent */}
            <UiEntity
              uiTransform={{
                width: 3,
                height: '100%',
                positionType: 'absolute',
                position: { left: 0, top: 0 }
              }}
              uiBackground={{
                color: UITheme.colors.danger
              }}
            />
            
            <Label 
              value="⚔ TOTAL KILLS" 
              fontSize={UITheme.fontSize.large} 
              color={UITheme.colors.text} 
              textAlign="middle-left"
            />
            <Label 
              value={`${kills}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.danger} 
              textAlign="middle-right"
            />
          </UiEntity>
          
          {/* Headshots */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              padding: UITheme.spacing.medium,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
            uiBackground={{
              color: Color4.create(0, 0, 0, 0.3)
            }}
          >
            {/* Left accent */}
            <UiEntity
              uiTransform={{
                width: 3,
                height: '100%',
                positionType: 'absolute',
                position: { left: 0, top: 0 }
              }}
              uiBackground={{
                color: UITheme.colors.warning
              }}
            />
            
            <Label 
              value="🎯 HEADSHOTS" 
              fontSize={UITheme.fontSize.large} 
              color={UITheme.colors.text} 
              textAlign="middle-left"
            />
            <Label 
              value={`${headshots} (${headshotPercent}%)`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.warning} 
              textAlign="middle-right"
            />
          </UiEntity>
        </UiEntity>
        
        {/* Restart button */}
        <UiEntity
          uiTransform={{
            width: 450,
            height: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.primaryLight
          }}
        >
          {/* Button glow */}
          <UiEntity
            uiTransform={{
              width: '102%',
              height: '102%',
              positionType: 'absolute',
              position: { top: -2, left: -2 }
            }}
            uiBackground={{
              color: UITheme.colors.successGlow
            }}
          />
          
          {/* Button accent borders */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 3,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.success
            }}
          />
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 3,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.success
            }}
          />
          
          <Label
            value="► PRESS E TO RESTART"
            fontSize={UITheme.fontSize.xlarge}
            color={UITheme.colors.text}
            textAlign="middle-center"
          />
        </UiEntity>
        
        {/* Motivational text */}
        <Label
          value="Better luck next time, soldier!"
          fontSize={UITheme.fontSize.base}
          color={UITheme.colors.textMuted}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Main Game UI (In-Game HUD)
 */
export const MainUI = () => {
  const gameStateEntities = Array.from(engine.getEntitiesWith(GameState))
  const gameState = gameStateEntities.length > 0 ? GameState.getOrNull(gameStateEntities[0][0]) : null
  const score = gameState ? gameState.score : 0
  const wave = gameState ? gameState.currentWave : 0
  const kills = gameState ? gameState.kills : 0
  const headshots = gameState ? gameState.headshots : 0
  const isPaused = gameState ? gameState.paused : false

  const playerHealth = Health.getOrNull(engine.PlayerEntity)
  const currentHealth = playerHealth ? playerHealth.current : 0
  const maxHealth = playerHealth ? playerHealth.max : 100

  const playerEntities = Array.from(engine.getEntitiesWith(Player))
  const player = playerEntities.length > 0 ? Player.getOrNull(playerEntities[0][0]) : null
  const currentWeapon = player?.weapons[player.currentWeaponIndex]
  const weapon = currentWeapon ? Weapon.getOrNull(currentWeapon) : null
  const type = weapon ? weapon.type : 'None'
  const ammo = weapon ? weapon.ammo : 0
  const storedAmmo = weapon ? weapon.storedAmmo : 0

  const playerBuffs = PlayerBuffs.getOrNull(engine.PlayerEntity)
  const currentTime = Date.now()

  // Calculate remaining duration for active power-ups
  const fireRateRemaining = playerBuffs ? Math.max(0, (playerBuffs.fireRateExpiry - currentTime) / 1000) : 0
  const pointsRemaining = playerBuffs ? Math.max(0, (playerBuffs.pointsExpiry - currentTime) / 1000) : 0

  // Check proximity to machines
  const playerPos = Transform.get(engine.PlayerEntity).position
  const shotgunMachine = WeaponMachine.getOrNull(shotgunMachineEntity)
  const rifleMachine = WeaponMachine.getOrNull(rifleMachineEntity)
  const doubleTapMachine = DoubleTapMachine.getOrNull(doubleTapMachineEntity)
  const royalArmorMachine = RoyalArmorMachine.getOrNull(royalArmorMachineEntity)
  const quickReloadMachine = QuickReloadMachine.getOrNull(quickReloadMachineEntity)
  const executionersChestMachine = ExecutionersChestMachine.getOrNull(executionersChestMachineEntity)

  const isNearShotgun = shotgunMachine ? Vector3.distance(playerPos, shotgunMachine.position) < 3 : false
  const isNearRifle = rifleMachine ? Vector3.distance(playerPos, rifleMachine.position) < 3 : false
  const isNearDoubleTap = doubleTapMachine ? Vector3.distance(playerPos, doubleTapMachine.position) < 3 : false
  const isNearRoyalArmor = royalArmorMachine ? Vector3.distance(playerPos, royalArmorMachine.position) < 3 : false
  const isNearQuickReload = quickReloadMachine ? Vector3.distance(playerPos, quickReloadMachine.position) < 3 : false
  const isNearExecutionersChest = executionersChestMachine
    ? Vector3.distance(playerPos, executionersChestMachine.position) < 3
    : false

  const hasShotgun = player?.weapons.some((weapon) => Weapon.getOrNull(weapon)?.type === 'shotgun')
  const hasRifle = player?.weapons.some((weapon) => Weapon.getOrNull(weapon)?.type === 'rifle')

  // Calculate damage screen opacity
  let damageScreenOpacity = 0
  if (playerHealth) {
    const timeSinceDamage = (currentTime - (playerHealth.lastDamageTime || 0)) / 1000
    if (timeSinceDamage < 1) {
      damageScreenOpacity = 0.5 * (1 - timeSinceDamage)
    }
  }

  // Calculate health percentage and color
  const healthPercentage = Math.max(0, (currentHealth / maxHealth) * 100)
  const healthColor = 
    healthPercentage > 60 ? UITheme.colors.success :
    healthPercentage > 30 ? UITheme.colors.warning :
    UITheme.colors.danger

  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start'
      }}
      uiBackground={{
        color: Color4.create(0, 0, 0, 0)
      }}
    >
      {/* Wave Info & Title - Top Right Corner */}
      {gameState?.currentWave && gameState.currentWave > 0 && gameState.currentWave <= 5 && (
        <UiEntity
          uiTransform={{
            width: 350,
            height: 'auto',
            positionType: 'absolute',
            position: { top: 10, right: 10 },
            padding: 15,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end'
          }}
          uiBackground={{
            color: Color4.create(0, 0, 0, 0.7)
          }}
        >
          <Label
            value={STORY_WAVES[gameState.currentWave - 1]?.chapterTitle || ''}
            fontSize={16}
            color={Color4.create(1, 0.8, 0, 1)}
            textAlign="middle-right"
          />
          <Label
            value={`Wave ${gameState.currentWave}/5 | Kills: ${gameState.zombiesKilledThisWave || 0}`}
            fontSize={14}
            color={Color4.White()}
            textAlign="middle-right"
            uiTransform={{
              margin: { top: 5 }
            }}
          />
          {gameState.bossSpawned && (
            <Label
              value={`BOSS: ${gameState.bossAlive ? 'FIGHTING' : 'DEFEATED'}`}
              fontSize={14}
              color={gameState.bossAlive ? Color4.Red() : Color4.Green()}
              textAlign="middle-right"
              uiTransform={{
                margin: { top: 5 }
              }}
            />
          )}
        </UiEntity>
      )}

      {/* Damage screen effect */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          positionType: 'absolute',
          position: { top: 0, left: 0 }
        }}
        uiBackground={{
          color: Color4.create(1, 0, 0, damageScreenOpacity)
        }}
      />

      {/* Comprehensive HUD Panel - Top Right (HIDDEN for side-scrolling mode) */}
      <UiEntity
        uiTransform={{
          width: 420,
          height: 'auto',
          maxHeight: '90%',
          positionType: 'absolute',
          position: { top: UITheme.spacing.medium, right: UITheme.spacing.medium },
          padding: UITheme.spacing.medium,
          display: 'none', // HIDDEN - not needed for side-scrolling mode
          flexDirection: 'column'
        }}
        uiBackground={{
          color: UITheme.colors.glass
        }}
      >
        {/* Top accent border */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 3,
            positionType: 'absolute',
            position: { top: 0, left: 0 }
          }}
          uiBackground={{
            color: UITheme.colors.accent
          }}
        />

        {/* === SECTION 1: Health === */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.medium },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              margin: { bottom: UITheme.spacing.xs },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Label 
              value="HEALTH" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.textSecondary} 
              textAlign="middle-left"
            />
            <Label 
              value={`${Math.max(0, Math.floor(currentHealth))} / ${maxHealth}`} 
              fontSize={UITheme.fontSize.large} 
              color={healthColor} 
              textAlign="middle-right"
            />
          </UiEntity>
          
          {/* Health bar */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 24
            }}
            uiBackground={{
              color: UITheme.colors.glassDark
            }}
          >
            <UiEntity
              uiTransform={{
                width: `${healthPercentage}%`,
                height: '100%'
              }}
              uiBackground={{
                color: healthColor
              }}
            />
            
            {/* Low health pulse */}
            {healthPercentage < 30 && (
              <UiEntity
                uiTransform={{
                  width: '100%',
                  height: '100%',
                  positionType: 'absolute',
                  position: { top: 0, left: 0 }
                }}
                uiBackground={{
                  color: Color4.create(healthColor.r, healthColor.g, healthColor.b, 0.3)
                }}
              />
            )}
          </UiEntity>
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 1,
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.divider
          }}
        />

        {/* === SECTION 2: Wave & Score === */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.medium },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Wave */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              margin: { bottom: UITheme.spacing.small },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Label 
              value="WAVE" 
              fontSize={UITheme.fontSize.base} 
              color={UITheme.colors.textSecondary} 
              textAlign="middle-left"
            />
            <Label 
              value={`${wave}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.accent} 
              textAlign="middle-right"
            />
          </UiEntity>
          
          {/* Score */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Label 
              value="SCORE" 
              fontSize={UITheme.fontSize.base} 
              color={UITheme.colors.textSecondary} 
              textAlign="middle-left"
            />
            <Label 
              value={`${score}`} 
              fontSize={UITheme.fontSize.large} 
              color={UITheme.colors.gold} 
              textAlign="middle-right"
            />
          </UiEntity>
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 1,
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.divider
          }}
        />

        {/* === SECTION 2.5: Ally Zombies === */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.medium },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Label 
            value="ZOMBIES" 
            fontSize={UITheme.fontSize.base} 
            color={UITheme.colors.textSecondary} 
            textAlign="middle-left"
          />
          <Label 
            value={`${getTotalZombieCount()}`} 
            fontSize={UITheme.fontSize.xlarge} 
            color={Color4.create(0, 1, 0.5, 1)} 
            textAlign="middle-right"
          />
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 1,
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.divider
          }}
        />

        {/* === SECTION 3: Weapon & Ammo === */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.medium },
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Weapon name */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              margin: { bottom: UITheme.spacing.xs },
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Label 
              value={`WEAPON: ${type.toUpperCase()}`} 
              fontSize={UITheme.fontSize.medium} 
              color={UITheme.colors.text} 
              textAlign="middle-left"
            />
          </UiEntity>
          
          {/* Ammo display */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <Label 
              value="AMMO" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.textSecondary} 
              textAlign="middle-left"
            />
            <Label 
              value={`${ammo} / ${storedAmmo}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={ammo === 0 ? UITheme.colors.danger : UITheme.colors.cyan} 
              textAlign="middle-right"
            />
          </UiEntity>
        </UiEntity>

        {/* Divider */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 1,
            margin: { bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.divider
          }}
        />

        {/* === SECTION 4: Combat Stats === */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: { bottom: UITheme.spacing.medium },
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}
        >
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Label 
              value={`${kills}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.text} 
              textAlign="middle-center"
            />
            <Label 
              value="KILLS" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.textMuted} 
              textAlign="middle-center"
            />
          </UiEntity>
          
          <UiEntity
            uiTransform={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
          >
            <Label 
              value={`${headshots}`} 
              fontSize={UITheme.fontSize.xlarge} 
              color={UITheme.colors.warning} 
              textAlign="middle-center"
            />
            <Label 
              value="HEADSHOTS" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.textMuted} 
              textAlign="middle-center"
            />
          </UiEntity>
        </UiEntity>

        {/* === SECTION 5: Active Perks === */}
        {(playerBuffs?.damageMultiplier === 2 || 
          playerBuffs?.pointsMultiplier === 2 || 
          playerHealth?.max === 200 || 
          playerBuffs?.reloadSpeedMultiplier === 0.5) && (
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              margin: { bottom: UITheme.spacing.medium },
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Divider */}
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 1,
                margin: { bottom: UITheme.spacing.small }
              }}
              uiBackground={{
                color: UITheme.colors.divider
              }}
            />
            
            <Label 
              value="ACTIVE PERKS" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.purple} 
              textAlign="middle-left"
              uiTransform={{
                margin: { bottom: UITheme.spacing.small }
              }}
            />
            
            {playerBuffs?.damageMultiplier === 2 && (
              <Badge text="Double Tap (2x Dmg)" variant="info" />
            )}
            {playerBuffs?.pointsMultiplier === 2 && (
              <Badge 
                text={`Double Points (${pointsRemaining.toFixed(1)}s)`} 
                variant="warning" 
                pulse={true}
              />
            )}
            {playerHealth?.max === 200 && (
              <Badge text="Royal Armor (2x HP)" variant="success" />
            )}
            {playerBuffs?.reloadSpeedMultiplier === 0.5 && (
              <Badge text="Quick Reload (2x)" variant="success" />
            )}
          </UiEntity>
        )}

        {/* === SECTION 6: Actions & Interactions === */}
        {(ammo === 0 || 
          isNearShotgun || 
          isNearRifle || 
          isNearDoubleTap || 
          isNearRoyalArmor || 
          isNearQuickReload || 
          isNearExecutionersChest ||
          playerBuffs?.fireRateMultiplier === 0.5) && (
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Divider */}
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 1,
                margin: { bottom: UITheme.spacing.small }
              }}
              uiBackground={{
                color: UITheme.colors.divider
              }}
            />
            
            <Label 
              value="ACTIONS" 
              fontSize={UITheme.fontSize.small} 
              color={UITheme.colors.textSecondary} 
              textAlign="middle-left"
              uiTransform={{
                margin: { bottom: UITheme.spacing.small }
              }}
            />
            
            {/* Critical warnings first */}
            <InteractionPrompt 
              condition={ammo === 0 && storedAmmo === 0} 
              text="Buy More Ammo!" 
              color={UITheme.colors.danger}
              icon="!"
              pulse={true}
            />
            <InteractionPrompt 
              condition={ammo === 0 && storedAmmo > 0} 
              text="Press F to Reload" 
              color={UITheme.colors.warning}
              icon="R"
              pulse={true}
            />
            
            {/* Active power-ups */}
            <InteractionPrompt
              condition={playerBuffs?.fireRateMultiplier === 0.5}
              text={`Fire Rate: ${fireRateRemaining.toFixed(1)}s`}
              color={UITheme.colors.success}
            />
            
            {/* Machine interactions */}
            <InteractionPrompt
              condition={isNearShotgun}
              text={
                hasShotgun
                  ? `Shotgun Ammo (${shotgunMachine?.shotgunAmmoPrice})`
                  : `Buy Shotgun (${shotgunMachine?.shotgunPrice})`
              }
              icon="E"
            />
            <InteractionPrompt
              condition={isNearRifle}
              text={
                hasRifle 
                  ? `Rifle Ammo (${rifleMachine?.rifleAmmoPrice})` 
                  : `Buy Rifle (${rifleMachine?.riflePrice})`
              }
              icon="E"
            />
            <InteractionPrompt
              condition={isNearDoubleTap}
              text={doubleTapMachine?.purchased ? 'Double Tap Purchased' : `Double Tap (${doubleTapMachine?.price})`}
              color={doubleTapMachine?.purchased ? UITheme.colors.success : undefined}
              icon={doubleTapMachine?.purchased ? "OK" : "E"}
            />
            <InteractionPrompt
              condition={isNearRoyalArmor}
              text={royalArmorMachine?.purchased ? 'Royal Armor Purchased' : `Royal Armor (${royalArmorMachine?.price})`}
              color={royalArmorMachine?.purchased ? UITheme.colors.success : undefined}
              icon={royalArmorMachine?.purchased ? "OK" : "E"}
            />
            <InteractionPrompt
              condition={isNearQuickReload}
              text={quickReloadMachine?.purchased ? 'Quick Reload Purchased' : `Quick Reload (${quickReloadMachine?.price})`}
              color={quickReloadMachine?.purchased ? UITheme.colors.success : undefined}
              icon={quickReloadMachine?.purchased ? "OK" : "E"}
            />
            <InteractionPrompt
              condition={isNearExecutionersChest}
              text={`Upgrade (${executionersChestMachine?.price})`}
              icon="E"
            />
          </UiEntity>
        )}

        {/* Divider before pause button */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 1,
            margin: { top: UITheme.spacing.medium, bottom: UITheme.spacing.medium }
          }}
          uiBackground={{
            color: UITheme.colors.divider
          }}
        />

        {/* Pause Button */}
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          uiBackground={{
            color: UITheme.colors.primaryLight
          }}
          onMouseDown={() => {
            const mutableGameState = GameState.getMutable(gameStateEntity)
            if (!mutableGameState.paused) {
              mutableGameState.paused = true
              AudioSource.playSound(pauseSoundEntity, 'sounds/zombie-sounds/pause-button.mp3')
            }
          }}
        >
          {/* Button border accents */}
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 2,
              positionType: 'absolute',
              position: { top: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.accent
            }}
          />
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 2,
              positionType: 'absolute',
              position: { bottom: 0, left: 0 }
            }}
            uiBackground={{
              color: UITheme.colors.accent
            }}
          />
          
          <Label 
            value="PAUSE GAME" 
            fontSize={UITheme.fontSize.medium} 
            color={UITheme.colors.text} 
            textAlign="middle-center"
          />
        </UiEntity>
      </UiEntity>

      {/* Pause indicator */}
      {isPaused && (
        <UiEntity
          uiTransform={{
            width: '100%',
            height: '100%',
            positionType: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
          uiBackground={{
            color: UITheme.colors.overlayDark
          }}
        >
          {/* Pause card */}
          <UiEntity
            uiTransform={{
              width: 500,
              height: 'auto',
              padding: UITheme.spacing.xxl,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            uiBackground={{
              color: UITheme.colors.glass
            }}
          >
            {/* Top accent */}
            <UiEntity
              uiTransform={{
                width: '100%',
                height: 3,
                positionType: 'absolute',
                position: { top: 0, left: 0 }
              }}
              uiBackground={{
                color: UITheme.colors.accent
              }}
            />
            
            <Label 
              value="PAUSED" 
              fontSize={UITheme.fontSize.hero} 
              color={UITheme.colors.text} 
              textAlign="middle-center"
              uiTransform={{
                margin: { bottom: UITheme.spacing.large }
              }}
            />
            <Label
              value="Press E to Resume"
              fontSize={UITheme.fontSize.large}
              color={UITheme.colors.textSecondary}
              textAlign="middle-center"
            />
          </UiEntity>
        </UiEntity>
      )}

      {/* Fade overlay for wave transitions */}
      {getFadeOverlay()}
    </UiEntity>
  )
}

