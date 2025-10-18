/**
 * Background Sound System for Neural Collapse
 * Plays ambient background sounds like police sirens
 */

import { AudioSource } from '@dcl/sdk/ecs'
import { getGamePhase, isPaused } from '../core/GameState'
import { playSound } from '../audio/SoundManager'

/**
 * Background siren sound system
 * Randomly plays police sirens every 30-60 seconds
 */
export function backgroundSirenSoundSystem(dt: number) {
  if (getGamePhase() !== 'playing') return
  if (isPaused()) return

  // Randomly play a siren sound every 30-60 seconds
  // Math.random() < 0.001 means approximately once per 1000 frames
  // At 60fps, that's roughly every 16-17 seconds
  if (Math.random() < 0.001) {
    const sirenSound =
      Math.random() < 0.5 ? 'sounds/background/police-sirens1.mp3' : 'sounds/background/police-sirens2.mp3'
    playSound('backgroundSiren', sirenSound)
    console.log('Playing background police siren sound')
  }
}
