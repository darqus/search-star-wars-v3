type ApiCharacterResponse = {
  id: string
  name: string
  description?: string
  image?: string
}

type ApiSearchResponse = {
  results: ApiCharacterResponse[]
  total: number
  page: number
  pages: number
}

/**
 * Character domain entity
 */
export class Character {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly description: string,
    public readonly image: string,
    public readonly endpoint: string
  ) {
    this.validate()
  }

  /**
   * Create from API response
   */
  static fromApiResponse(data: ApiCharacterResponse, endpoint: string): Character {
    return new Character(
      data.id,
      data.name,
      data.description ?? '',
      data.image ?? '',
      endpoint
    )
  }

  /**
   * Get display name for UI
   */
  getDisplayName(): string {
    return this.name
  }

  /**
   * Check if character has a valid image
   */
  hasImage(): boolean {
    return Boolean(this.image && this.image.length > 0)
  }

  /**
   * Get full image URL
   */
  getImageUrl(baseUrl: string): string {
    if (!this.hasImage()) {
      return ''
    }

    if (this.image.startsWith('http')) {
      return this.image
    }

    // Combine base URL with endpoint and image path
    const cleanImage = this.image.replace(/^\/+|\/+$/g, '')

    return `${baseUrl}/${this.endpoint}/${cleanImage}`
  }

  /**
   * Compare characters by ID
   */
  equals(other: Character): boolean {
    return this.id === other.id
  }

  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      image: this.image,
      endpoint: this.endpoint,
    }
  }

  /**
   * Validate character data
   */
  private validate(): void {
    if (!this.id || this.id.trim().length === 0) {
      throw new Error('Character ID cannot be empty')
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Character name cannot be empty')
    }
  }
}

/**
 * Search result entity
 */
export class SearchResult {
  constructor(
    public readonly characters: Character[],
    public readonly totalCount: number,
    public readonly currentPage: number,
    public readonly hasNextPage: boolean,
    public readonly hasPrevPage: boolean
  ) {}

  /**
   * Create empty result
   */
  static empty(): SearchResult {
    return new SearchResult([], 0, 1, false, false)
  }

  /**
   * Create from API response
   */
  static fromApiResponse(data: ApiSearchResponse, endpoint: string): SearchResult {
    const characters = data.results.map((item) => Character.fromApiResponse(item, endpoint))

    return new SearchResult(
      characters,
      data.total,
      data.page,
      data.page < data.pages,
      data.page > 1
    )
  }

  /**
   * Check if result is empty
   */
  isEmpty(): boolean {
    return this.characters.length === 0
  }

  /**
   * Get character by ID
   */
  findCharacterById(id: string): Character | undefined {
    return this.characters.find((character) => character.id === id)
  }
}
