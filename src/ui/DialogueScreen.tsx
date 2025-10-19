/**
 * Dialogue Screen Component
 * Pre-game conversation between Alara and Doctor Yan
 */

import ReactEcs, { UiEntity, Label } from '@dcl/sdk/react-ecs'
import { Color4 } from '@dcl/sdk/math'
import { UITheme } from './UITheme'

export interface DialogueLine {
  speaker: string
  text: string
  duration: number // milliseconds
}

export interface DialogueScreenProps {
  onComplete: () => void
}

// Dialogue sequence
const DIALOGUE: DialogueLine[] = [
  { speaker: 'DR. YAN', text: 'Neural link established. Fragment Seven is loaded and stable.', duration: 3000 },
  { speaker: 'ALARA', text: 'I can feel it pulling me. What am I going to see in there?', duration: 3000 },
  { speaker: 'DR. YAN', text: 'Your memory of the street, but fragmented. Frozen in that moment.\nAnd... the anomalies.', duration: 3500 },
  { speaker: 'ALARA', text: 'Anomalies? What are those?', duration: 2500 },
  { speaker: 'DR. YAN', text: 'When trauma echoes fragment, they create hostile manifestations.\nDefense mechanisms your mind created. They\'ll appear as distorted humans.', duration: 4000 },
  { speaker: 'ALARA', text: 'The things in my nightmares... the rotting people?', duration: 3000 },
  { speaker: 'DR. YAN', text: 'Yes. Your subconscious perceived them as undead, zombies.\nThey\'re not real, but they\'ll feel real. They WILL attack.', duration: 4000 },
  { speaker: 'ALARA', text: 'How do I defend myself?', duration: 2500 },
  { speaker: 'DR. YAN', text: 'The fragment contains projections - weapons from your memories.\nYou\'ll need to fight. The anomalies are drawn to living consciousness.\nThey\'ll sense you immediately.', duration: 4500 },
  { speaker: 'ALARA', text: 'This sounds dangerous.', duration: 2500 },
  { speaker: 'DR. YAN', text: 'It is. But you\'re not truly there - just your mind.\nStill, be careful. If the trauma overwhelms you, you could get lost.', duration: 4000 },
  { speaker: 'ALARA', text: 'What happens if I get lost?', duration: 2500 },
  { speaker: 'DR. YAN', text: 'Let\'s not find out. Stay focused. Fight when you must.\nFind the memory. Break the loop. I\'ll be monitoring everything.', duration: 4000 },
  { speaker: 'ALARA', text: 'Okay... I\'m ready.', duration: 2500 },
  { speaker: 'DR. YAN', text: 'Beginning transfer now. Good luck, Alara.', duration: 3000 }
]

// Track current line
let currentLineIndex = 0
let lineStartTime = 0
let isSkipped = false
let completionCallback: (() => void) | null = null

export function DialogueScreen({ onComplete }: DialogueScreenProps) {
  const currentTime = Date.now()
  
  // Store completion callback
  if (completionCallback === null) {
    completionCallback = onComplete
  }
  
  // Initialize on first render
  if (lineStartTime === 0) {
    lineStartTime = currentTime
  }
  
  // Handle skip immediately
  if (isSkipped) {
    console.log('⏭️ Dialogue skipped - completing immediately')
    // Reset for next time
    currentLineIndex = 0
    lineStartTime = 0
    isSkipped = false
    const callback = completionCallback
    completionCallback = null
    callback()
    return null
  }
  
  // Check if current line should advance
  const currentLine = DIALOGUE[currentLineIndex]
  const elapsed = currentTime - lineStartTime
  
  if (elapsed >= currentLine.duration) {
    currentLineIndex++
    lineStartTime = currentTime
    
    // Check if dialogue is complete
    if (currentLineIndex >= DIALOGUE.length) {
      console.log('✅ Dialogue completed naturally')
      // Reset for next time
      currentLineIndex = 0
      lineStartTime = 0
      const callback = completionCallback
      completionCallback = null
      callback()
      return null
    }
  }
  
  // Calculate fade effect for smoother transitions
  const fadeTime = 500 // ms
  let opacity = 1
  if (elapsed < fadeTime) {
    opacity = elapsed / fadeTime
  } else if (elapsed > currentLine.duration - fadeTime) {
    opacity = (currentLine.duration - elapsed) / fadeTime
  }
  
  // Determine speaker color
  const isDrYan = currentLine.speaker === 'DR. YAN'
  const speakerColor = isDrYan ? UITheme.colors.cyan : UITheme.colors.accent
  
  // Special effect for "anomalies" keyword
  const hasAnomalies = currentLine.text.toLowerCase().includes('anomal')
  const textColor = hasAnomalies 
    ? Color4.create(1, 0.3, 0.3, opacity) // Red tint for danger words
    : Color4.create(1, 1, 1, opacity)

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
        color: Color4.Black()
      }}
    >
      {/* Dialogue container */}
      <UiEntity
        uiTransform={{
          width: 800,
          height: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        {/* Speaker name */}
        <Label
          value={currentLine.speaker}
          fontSize={UITheme.fontSize.small}
          color={Color4.create(speakerColor.r, speakerColor.g, speakerColor.b, opacity)}
          textAlign="middle-center"
          uiTransform={{
            margin: { bottom: UITheme.spacing.medium }
          }}
        />
        
        {/* Dialogue text */}
        <Label
          value={currentLine.text}
          fontSize={UITheme.fontSize.large}
          color={textColor}
          textAlign="middle-center"
        />
      </UiEntity>
      
      {/* Skip indicator */}
      <UiEntity
        uiTransform={{
          width: 'auto',
          height: 'auto',
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.large, right: UITheme.spacing.large }
        }}
      >
        <Label
          value="Press E to Skip"
          fontSize={UITheme.fontSize.small}
          color={Color4.create(0.5, 0.5, 0.5, 0.7)}
          textAlign="middle-right"
        />
      </UiEntity>
      
      {/* Progress indicator */}
      <UiEntity
        uiTransform={{
          width: 400,
          height: 2,
          positionType: 'absolute',
          position: { bottom: UITheme.spacing.xl }
        }}
        uiBackground={{
          color: Color4.create(0.2, 0.2, 0.2, 0.5)
        }}
      >
        {/* Progress bar */}
        <UiEntity
          uiTransform={{
            width: `${((currentLineIndex + 1) / DIALOGUE.length) * 100}%`,
            height: '100%'
          }}
          uiBackground={{
            color: UITheme.colors.accent
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}

/**
 * Skip the entire dialogue sequence
 */
export function skipDialogue() {
  console.log('🚀 Skip dialogue triggered')
  isSkipped = true
}

/**
 * Reset dialogue state (for replaying)
 */
export function resetDialogue() {
  currentLineIndex = 0
  lineStartTime = 0
  isSkipped = false
}

