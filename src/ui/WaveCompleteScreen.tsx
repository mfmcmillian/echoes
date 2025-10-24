/**
 * Wave Complete Screen
 * Shows between boss death and dialogue (waits for player input)
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'

export interface WaveCompleteProps {
  waveNumber: number
  onComplete: () => void
}

let startTime = 0
let shouldComplete = false

export function WaveCompleteScreen({ waveNumber, onComplete }: WaveCompleteProps) {
  const currentTime = Date.now()
  
  // Initialize on first render
  if (startTime === 0) {
    startTime = currentTime
    shouldComplete = false
    console.log(`🎉 Wave ${waveNumber} Complete screen showing (press E to continue)...`)
  }
  
  // Check if player triggered completion
  if (shouldComplete) {
    console.log(`✅ Wave complete screen finished (player pressed E)`)
    startTime = 0
    shouldComplete = false
    onComplete()
    return null
  }
  
  const elapsed = currentTime - startTime
  
  // Fade in effect
  const fadeTime = 500
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  }

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
        color: Color4.create(0, 0, 0, 0.9)
      }}
    >
      {/* Main text */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Label
          value={`WAVE ${waveNumber}`}
          fontSize={48}
          color={Color4.create(1, 0.8, 0, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: 20 }
          }}
        />
        <Label
          value="COMPLETE"
          fontSize={72}
          color={Color4.create(0, 1, 0.5, opacity)}
          textAlign="middle-center"
        />
      </UiEntity>

      {/* Continue prompt */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.large }
        }}
      >
        <Label
          value="Press E to Continue"
          fontSize={UITheme.fontSize.large}
          color={Color4.create(1, 1, 1, opacity * 0.8)}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Trigger wave complete to finish
 */
export function triggerWaveComplete() {
  console.log('🚀 Wave complete continue triggered')
  shouldComplete = true
}

/**
 * Reset wave complete screen
 */
export function resetWaveComplete() {
  startTime = 0
  shouldComplete = false
}

