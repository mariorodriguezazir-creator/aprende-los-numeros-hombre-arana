import { VIDEO_UNLOCK_MILESTONES } from '../types'

export interface VideoData {
  milestone: (typeof VIDEO_UNLOCK_MILESTONES)[number]
  youtubeId: string
  title: string
  description: string
}

export const VIDEO_REWARDS: VideoData[] = [
  { milestone: 10, youtubeId: 'qHkEDhTaPnk', title: '¡Felicitaciones por el primer bloque!', description: 'Aprendiste los números del 1 al 10' },
  { milestone: 20, youtubeId: 'lUy96iM6gCc', title: '¡Increíble! ¡Llegaste al 20!', description: 'Aprendiste los números del 11 al 20' },
  { milestone: 30, youtubeId: 'xpjGpFjgZ8E', title: '¡Sos un crack! ¡Llegaste al 30!', description: 'Aprendiste los números del 21 al 30' },
  { milestone: 40, youtubeId: '4UGcNbbx6TQ', title: '¡Casi terminás! ¡Llegaste al 40!', description: 'Aprendiste los números del 31 al 40' },
  { milestone: 50, youtubeId: 'ebs2JdC8hqk', title: '¡Lo lograste! ¡Aprendiste todos los números!', description: 'Aprendiste todos los números del 1 al 50' },
]

export const VIDEO_BY_MILESTONE = Object.fromEntries(
  VIDEO_REWARDS.map((v) => [v.milestone, v]),
) as Record<(typeof VIDEO_UNLOCK_MILESTONES)[number], VideoData>

export const getVideoForMilestone = (milestone: number): VideoData | undefined =>
  VIDEO_BY_MILESTONE[milestone as (typeof VIDEO_UNLOCK_MILESTONES)[number]]
