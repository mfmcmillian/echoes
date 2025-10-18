/**
 * Game UI for Neural Collapse
 * Main game interface, start menu, and game over screen
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
import { UITheme } from './UITheme'
import { gameStateEntity } from '../core/GameState'
import { pauseSoundEntity } from '../audio/SoundManager'
import { GAME_NAME } from '../utils/constants'

/**
 * Start Menu UI
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
        color: Color4.create(0, 0, 0, 0.8)
      }}
    >
      <Label value={GAME_NAME} fontSize={UITheme.fontSize.title} color={UITheme.colors.text} textAlign="middle-center" />
      <UiEntity
        uiTransform={{
          width: 400,
          height: 100,
          margin: { top: UITheme.spacing.large }
        }}
      >
        <Label
          value="Press E to Start"
          fontSize={UITheme.fontSize.large}
          color={UITheme.colors.text}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Game Over Menu UI
 */
export const GameOverMenu = () => {
  const gameStateEntities = Array.from(engine.getEntitiesWith(GameState))
  const gameState = gameStateEntities.length > 0 ? GameState.getOrNull(gameStateEntities[0][0]) : null
  const score = gameState ? gameState.score : 0
  const wave = gameState ? gameState.currentWave : 0

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
        color: Color4.create(0, 0, 0, 0.8)
      }}
    >
      <Label value="Game Over" fontSize={UITheme.fontSize.title} color={UITheme.colors.danger} textAlign="middle-center" />
      <UiEntity
        uiTransform={{
          width: 400,
          height: 200,
          margin: { top: UITheme.spacing.large },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Label value={`Final Score: ${score}`} fontSize={32} color={UITheme.colors.text} textAlign="middle-center" />
        <Label
          value={`Wave Reached: ${wave}`}
          fontSize={UITheme.fontSize.large}
          color={UITheme.colors.text}
          textAlign="middle-center"
        />
        <Label
          value="Press E to Restart"
          fontSize={UITheme.fontSize.large}
          color={UITheme.colors.text}
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

      {/* Health bar */}
      <HealthBar currentHealth={currentHealth} maxHealth={maxHealth} />

      {/* Main game info panel */}
      <UiEntity
        uiTransform={{
          width: 300,
          height: 200,
          positionType: 'absolute',
          position: { top: UITheme.spacing.medium, right: UITheme.spacing.medium },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          justifyContent: 'flex-start'
        }}
        uiBackground={{
          color: UITheme.colors.primary
        }}
      >
        <Label value={`Score: ${score}`} fontSize={UITheme.fontSize.large} color={UITheme.colors.text} textAlign="middle-right" />
        <Label value={`Wave: ${wave}`} fontSize={UITheme.fontSize.large} color={UITheme.colors.text} textAlign="middle-right" />
        <Label value={`Kills: ${kills}`} fontSize={UITheme.fontSize.large} color={UITheme.colors.text} textAlign="middle-right" />
        <Label
          value={`Headshots: ${headshots}`}
          fontSize={UITheme.fontSize.large}
          color={UITheme.colors.text}
          textAlign="middle-right"
        />
        <Label
          value={`Weapon: ${type} (${ammo}/${storedAmmo})`}
          fontSize={UITheme.fontSize.large}
          color={UITheme.colors.text}
          textAlign="middle-right"
        />

        {/* Interaction prompts */}
        <InteractionPrompt condition={ammo === 0 && storedAmmo === 0} text="Buy More Ammo!" color={UITheme.colors.danger} />
        <InteractionPrompt condition={ammo === 0 && storedAmmo > 0} text="Press F to Reload" color={UITheme.colors.warning} />
        <InteractionPrompt
          condition={playerBuffs?.fireRateMultiplier === 0.5}
          text={`Fire Rate Boost: ${fireRateRemaining.toFixed(1)}s`}
          color={UITheme.colors.success}
        />
        <InteractionPrompt
          condition={isNearShotgun}
          text={
            hasShotgun
              ? `Press E for Shotgun Ammo (${shotgunMachine?.shotgunAmmoPrice} pts)`
              : `Press E for Shotgun (${shotgunMachine?.shotgunPrice} pts)`
          }
        />
        <InteractionPrompt
          condition={isNearRifle}
          text={
            hasRifle ? `Press E for Rifle Ammo (${rifleMachine?.rifleAmmoPrice} pts)` : `Press E for Rifle (${rifleMachine?.riflePrice} pts)`
          }
        />
        <InteractionPrompt
          condition={isNearDoubleTap}
          text={doubleTapMachine?.purchased ? 'Double Tap Purchased' : `Press E for Double Tap (${doubleTapMachine?.price} pts)`}
        />
        <InteractionPrompt
          condition={isNearRoyalArmor}
          text={royalArmorMachine?.purchased ? 'Royal Armor Purchased' : `Press E for Royal Armor (${royalArmorMachine?.price} pts)`}
        />
        <InteractionPrompt
          condition={isNearQuickReload}
          text={quickReloadMachine?.purchased ? 'Quick Reload Purchased' : `Press E for Quick Reload (${quickReloadMachine?.price} pts)`}
        />
        <InteractionPrompt
          condition={isNearExecutionersChest}
          text={`Press E to Upgrade Weapon (${executionersChestMachine?.price} pts)`}
        />
      </UiEntity>

      {/* Pause Button */}
      <UiEntity
        uiTransform={{
          width: UITheme.dimensions.button.width,
          height: UITheme.dimensions.button.height,
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.medium, right: UITheme.spacing.medium },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        uiBackground={{
          color: UITheme.colors.primary
        }}
        onMouseDown={() => {
          const mutableGameState = GameState.getMutable(gameStateEntity)
          if (!mutableGameState.paused) {
            mutableGameState.paused = true
            AudioSource.playSound(pauseSoundEntity, 'sounds/zombie-sounds/pause-button.mp3')
          }
        }}
      >
        <Label value="Pause" fontSize={UITheme.fontSize.medium} color={UITheme.colors.text} textAlign="middle-center" />
      </UiEntity>

      {/* Active Perks panel */}
      <UiEntity
        uiTransform={{
          width: UITheme.dimensions.panel.width,
          height: 150,
          positionType: 'absolute',
          position: { top: 35, left: UITheme.spacing.small },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}
        uiBackground={{
          color: UITheme.colors.primary
        }}
      >
        <Label value="Active Perks:" fontSize={UITheme.fontSize.large} color={UITheme.colors.text} textAlign="middle-left" />
        {playerBuffs?.damageMultiplier === 2 && (
          <Label value="• Double Tap (2x Damage)" fontSize={UITheme.fontSize.medium} color={UITheme.colors.purple} textAlign="middle-left" />
        )}
        {playerBuffs?.pointsMultiplier === 2 && (
          <Label
            value={`• Double Points (${pointsRemaining.toFixed(1)}s)`}
            fontSize={UITheme.fontSize.medium}
            color={UITheme.colors.warning}
            textAlign="middle-left"
          />
        )}
        {playerHealth?.max === 200 && (
          <Label value="• Royal Armor (2x Health)" fontSize={UITheme.fontSize.medium} color={UITheme.colors.gold} textAlign="middle-left" />
        )}
        {playerBuffs?.reloadSpeedMultiplier === 0.5 && (
          <Label
            value="• Quick Reload (2x Speed)"
            fontSize={UITheme.fontSize.medium}
            color={UITheme.colors.green}
            textAlign="middle-left"
          />
        )}
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
            justifyContent: 'center'
          }}
          uiBackground={{
            color: Color4.create(0, 0, 0, 0.7)
          }}
        >
          <Label value="PAUSED" fontSize={UITheme.fontSize.title} color={UITheme.colors.text} textAlign="middle-center" />
          <Label
            value="Press E to Resume"
            fontSize={UITheme.fontSize.large}
            color={UITheme.colors.text}
            textAlign="middle-center"
          />
        </UiEntity>
      )}
    </UiEntity>
  )
}

