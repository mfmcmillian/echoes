/**
 * Entry Cutscene Component
 * "Loading screen" video before game starts
 * Plays after dialogue sequence completes
 */

import ReactEcs, { Label, UiEntity } from '@dcl/sdk/react-ecs'
import { Color4, Color3, Vector3 } from '@dcl/sdk/math'
import { engine, VideoPlayer, Material, MeshRenderer, Transform, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'

// Track cutscene state
let isPlaying = false
let videoEntity: any = null
let blackBackgroundEntity: any = null

/**
 * Play entry cutscene (loading screen)
 */
export function playEntryCutscene(onComplete: () => void) {
  if (isPlaying) return
  isPlaying = true
  
  console.log('🎬 Starting entry cutscene (loading screen)...')
  
  // Calculate screen size
  const screenDistance = 0.5
  const hfovRad = Math.PI / 2
  const optimalWidth = 2 * screenDistance * Math.tan(hfovRad / 2)
  const optimalHeight = optimalWidth * (9 / 16)
  
  // Black background (parented to player camera)
  blackBackgroundEntity = engine.addEntity()
  Transform.createOrReplace(blackBackgroundEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, screenDistance + 0.1),
    scale: Vector3.create(10, 10, 0.01)
  })
  MeshRenderer.setPlane(blackBackgroundEntity)
  Material.setPbrMaterial(blackBackgroundEntity, {
    albedoColor: Color4.Black(),
    roughness: 1.0,
    metallic: 0,
    transparencyMode: MaterialTransparencyMode.MTM_OPAQUE
  })
  
  // Video screen (parented to player camera)
  videoEntity = engine.addEntity()
  Transform.createOrReplace(videoEntity, {
    parent: engine.CameraEntity,
    position: Vector3.create(0, 0, screenDistance),
    scale: Vector3.create(optimalWidth, optimalHeight, 0.1)
  })
  console.log(`📺 Entry video screen: ${optimalWidth.toFixed(2)}x${optimalHeight.toFixed(2)}`)
  
  // Add plane mesh for video display
  MeshRenderer.setPlane(videoEntity)
  
  // Add video player
  VideoPlayer.create(videoEntity, {
    src: 'https://dclstreams.com/media/videos/play/19e23d6a-27f1-47f8-baff-2141135b6b2c.m3u8',
    playing: true,
    volume: 1.0,
    loop: false // Don't loop, play once
  })
  
  // Create video texture
  const videoTexture = Material.Texture.Video({ videoPlayerEntity: videoEntity })
  
  // Apply video material
  Material.setPbrMaterial(videoEntity, {
    texture: videoTexture,
    roughness: 1.0,
    specularIntensity: 0,
    metallic: 0,
    emissiveTexture: videoTexture,
    emissiveIntensity: 0.6,
    emissiveColor: Color3.White()
  })
  console.log('✅ Entry video loaded and playing!')
  
  // Auto-end after 10 seconds (video duration + buffer)
  utils.timers.setTimeout(() => {
    console.log('🎬 Entry cutscene complete')
    endEntryCutscene(onComplete)
  }, 10000) // 10 seconds total
}

/**
 * End entry cutscene and cleanup
 */
function endEntryCutscene(onComplete: () => void) {
  if (!isPlaying) return
  
  console.log('🧹 Cleaning up entry cutscene...')
  
  // Stop video playback
  if (videoEntity && VideoPlayer.has(videoEntity)) {
    try {
      const videoPlayer = VideoPlayer.getMutable(videoEntity)
      videoPlayer.playing = false
      console.log('📹 Entry video stopped')
    } catch (e) {
      console.error('⚠️ Failed to stop entry video:', e)
    }
  }
  
  // Remove video entity
  if (videoEntity) {
    engine.removeEntity(videoEntity)
    videoEntity = null
    console.log('📺 Entry video screen removed')
  }
  
  // Remove black background
  if (blackBackgroundEntity) {
    engine.removeEntity(blackBackgroundEntity)
    blackBackgroundEntity = null
    console.log('🎥 Black background removed')
  }
  
  isPlaying = false
  
  console.log('✅ Entry cutscene cleanup complete!')
  
  // Start the game
  onComplete()
}

/**
 * Check if entry cutscene is currently playing
 */
export function isEntryCutscenePlaying(): boolean {
  return isPlaying
}

/**
 * Force cleanup (if needed)
 */
export function forceCleanupEntryCutscene(onComplete: () => void) {
  if (!isPlaying) {
    onComplete()
    return
  }
  console.log('🧹 Force cleaning up entry cutscene...')
  endEntryCutscene(onComplete)
}

/**
 * Entry Cutscene Overlay UI
 * Shows "ENTERING FRAGMENT" text over video
 */
export function EntryCutsceneOverlay() {
  if (!isPlaying) return null
  
  return (
    <UiEntity
      uiTransform={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center'
      }}
      uiBackground={{
        color: Color4.create(0, 0, 0, 0) // Transparent
      }}
    >
      {/* Loading text at bottom */}
      <UiEntity
        uiTransform={{
          width: '100%',
          height: 100,
          margin: { bottom: 50 },
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Label
          value="ENTERING FRAGMENT..."
          fontSize={28}
          color={Color4.White()}
          textAlign="middle-center"
        />
      </UiEntity>
    </UiEntity>
  )
}

