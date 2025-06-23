import type { SearchApiItem } from '@/types/api'

export const API_ENDPOINTS: SearchApiItem[] = [
  { api: 'characters', imgApiPath: 'characters' },
  { api: 'creatures', imgApiPath: 'creatures' },
  { api: 'droids', imgApiPath: 'droids' },
  { api: 'locations', imgApiPath: 'locations' },
  { api: 'organizations', imgApiPath: 'organizations' },
  { api: 'species', imgApiPath: 'species' },
  { api: 'vehicles', imgApiPath: 'vehicles' },
] as const

export const DEFAULT_PAGE_SIZE = 20
export const TRANSITION_DURATION = 300
