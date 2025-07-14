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
