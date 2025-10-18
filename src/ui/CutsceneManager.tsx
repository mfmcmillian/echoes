/**
 * Cutscene Manager for Neural Collapse
 * Manages cutscene state and UI rendering
 */

import ReactEcs from '@dcl/sdk/react-ecs'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { 
  playIntroCutscene, 
  skipCutscene, 
  handlePlayButton, 
  CutsceneOverlay,
  isCutscenePlaying
} from './IntroCutscene'
import { StartMenu } from './GameUI.js'
import { startGame } from '../core/GameController'

// Track if cutscene has been shown
let cutsceneShown = false

/**
 * Start cutscene and then show start menu when done
 */
export function startIntroCutscene() {
  if (cutsceneShown) {
    // Cutscene already shown, go straight to start menu
    ReactEcsRenderer.setUiRenderer(StartMenu)
    return
  }

  console.log('🎬 Initiating intro cutscene...')
  
  // Show cutscene UI overlay
  ReactEcsRenderer.setUiRenderer(CutsceneUI)
  
  // Start the cutscene
  playIntroCutscene(() => {
    // When cutscene ends, mark it as shown and start game directly
    cutsceneShown = true
    console.log('✅ Cutscene complete, starting game...')
    startGame()
  })
}

/**
 * Cutscene UI Component
 * Renders the cutscene overlay with skip/play buttons
 */
const CutsceneUI = () => {
  return (
    <CutsceneOverlay
      onSkip={() => {
        skipCutscene(() => {
          cutsceneShown = true
          console.log('⏭️ Skipped, starting game...')
          startGame()
        })
      }}
      onPlay={() => {
        handlePlayButton(() => {
          cutsceneShown = true
          console.log('▶️ Play clicked, starting game...')
          startGame()
        })
      }}
    />
  )
}

/**
 * Check if cutscene has been shown this session
 */
export function hasCutsceneBeenShown(): boolean {
  return cutsceneShown
}

/**
 * Reset cutscene state (for testing)
 */
export function resetCutscene() {
  cutsceneShown = false
}

