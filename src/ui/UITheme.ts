/**
 * UI Theme for Neural Collapse
 * Consistent styling across all UI components
 */

import { Color4 } from '@dcl/sdk/math'

export const UITheme = {
  colors: {
    primary: Color4.create(0.1, 0.1, 0.15, 0.9),
    text: Color4.create(1, 1, 1, 1),
    textSecondary: Color4.create(0.7, 0.7, 0.7, 1),
    success: Color4.create(0.2, 0.8, 0.2, 1),
    warning: Color4.create(0.9, 0.7, 0.2, 1),
    danger: Color4.create(0.9, 0.2, 0.2, 1),
    purple: Color4.create(0.7, 0.3, 0.9, 1),
    gold: Color4.create(1, 0.84, 0, 1),
    green: Color4.create(0.2, 0.9, 0.4, 1)
  },
  fontSize: {
    small: 14,
    medium: 18,
    large: 24,
    title: 48
  },
  spacing: {
    small: 10,
    medium: 20,
    large: 40
  },
  dimensions: {
    button: {
      width: 200,
      height: 50
    },
    panel: {
      width: 300
    }
  }
}
