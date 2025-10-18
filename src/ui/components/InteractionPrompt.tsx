/**
 * Interaction Prompt Component for Neural Collapse
 */

import ReactEcs, { Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from '../UITheme'

export interface InteractionPromptProps {
  condition: boolean
  text: string
  color?: Color4
}

export function InteractionPrompt({ condition, text, color }: InteractionPromptProps) {
  if (!condition) return null

  return (
    <Label
      value={text}
      fontSize={UITheme.fontSize.medium}
      color={color || UITheme.colors.warning}
      textAlign="middle-right"
    />
  )
}

