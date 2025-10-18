/**
 * Health Bar Component for Neural Collapse
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface HealthBarProps {
  currentHealth: number
  maxHealth: number
}

export function HealthBar({ currentHealth, maxHealth }: HealthBarProps) {
  const healthPercentage = (currentHealth / maxHealth) * 100

  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 60,
        positionType: 'absolute',
        position: { bottom: UITheme.spacing.medium, left: UITheme.spacing.medium },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start'
      }}
    >
      <Label
        value={`Health: ${Math.max(0, currentHealth)}/${maxHealth}`}
        fontSize={UITheme.fontSize.medium}
        color={UITheme.colors.text}
        textAlign="middle-left"
      />
      {/* Health bar background */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 30,
          margin: { top: 5 }
        }}
        uiBackground={{
          color: Color4.create(0.2, 0.2, 0.2, 0.8)
        }}
      >
        {/* Health bar fill */}
        <UiEntity
          uiTransform={{
            width: `${healthPercentage}%`,
            height: '100%'
          }}
          uiBackground={{
            color:
              healthPercentage > 60
                ? UITheme.colors.success
                : healthPercentage > 30
                ? UITheme.colors.warning
                : UITheme.colors.danger
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

