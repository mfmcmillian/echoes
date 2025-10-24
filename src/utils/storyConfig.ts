/**
 * Story Mode Configuration
 * Wave definitions, boss stats, and story text
 */

export type StoryWave = {
  waveNumber: number
  chapterTitle: string
  storyText: string
  zombieCount: number
  miniBosses: number
  bigBoss: boolean
  difficulty: 'easy' | 'medium' | 'hard'
}

export const STORY_WAVES: StoryWave[] = [
  {
    waveNumber: 1,
    chapterTitle: 'Gas Station - The Outbreak',
    storyText: 'The infection spread fast. The gas station is your last refuge. Clear the area and find survivors.',
    zombieCount: 5, // Increased from 20
    miniBosses: 1, // Added 1 mini-boss
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    waveNumber: 2,
    chapterTitle: 'Main Street - Downtown Ruins',
    storyText: 'Push through downtown. The evacuation point is ahead. Watch for larger infected...',
    zombieCount: 5, // Increased from 30
    miniBosses: 2,
    bigBoss: true,
    difficulty: 'easy'
  },
  {
    waveNumber: 3,
    chapterTitle: 'Shopping District - Supply Run',
    storyText: 'Supplies are critical. The shopping district is crawling with them. Stay sharp.',
    zombieCount: 5, // Increased from 40
    miniBosses: 3,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    waveNumber: 4,
    chapterTitle: 'Industrial Zone - The Horde Thickens',
    storyText: "The industrial zone is a death trap. They're getting stronger. Don't give up.",
    zombieCount: 5, // Increased from 50
    miniBosses: 4,
    bigBoss: true,
    difficulty: 'medium'
  },
  {
    waveNumber: 5,
    chapterTitle: 'Evacuation Point - The Final Stand',
    storyText: "This is it. The evacuation point. Clear the area and we're out. One last push!",
    zombieCount: 5, // Increased from 60
    miniBosses: 5,
    bigBoss: true,
    difficulty: 'hard'
  }
]

// Boss health scaling per wave (ADJUSTED - easier)
export const BOSS_HEALTH_BASE = 300 // Was 400
export const BOSS_HEALTH_PER_WAVE = 200 // Was 300 - Wave 1: 300, Wave 2: 500, Wave 3: 700, etc.

export const MINI_BOSS_HEALTH_BASE = 150 // Was 200
export const MINI_BOSS_HEALTH_PER_WAVE = 75 // Was 100

// Boss size scaling
export const MINI_BOSS_SCALE = 1.5
export const BIG_BOSS_SCALE = 2.0

// Story mode game state
export type StoryPhase = 'story' | 'wave' | 'bossSpawned' | 'victory' | 'endless'

export function getBossHealth(wave: number, isBigBoss: boolean): number {
  if (isBigBoss) {
    return BOSS_HEALTH_BASE + (wave - 1) * BOSS_HEALTH_PER_WAVE
  } else {
    return MINI_BOSS_HEALTH_BASE + (wave - 1) * MINI_BOSS_HEALTH_PER_WAVE
  }
}
