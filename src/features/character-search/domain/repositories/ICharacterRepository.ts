import type { Character, SearchResult } from '../entities/Character'

export type CharacterFilter = {
  search?: string
  page?: number
  limit?: number
}

export type SearchParams = {
  endpoint: string
  search?: string
  page: number
  limit: number
}

export type ICharacterRepository = {
  searchCharacters(filter: CharacterFilter): Promise<SearchResult>
  getCharacter(id: string): Promise<Character | null>
}

export type ICacheRepository = {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>
  delete(key: string): Promise<void>
  clear(): Promise<void>
  has(key: string): Promise<boolean>
}
