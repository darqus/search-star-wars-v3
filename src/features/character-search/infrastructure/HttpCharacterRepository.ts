import { Character as CharacterEntity, SearchResult as SearchResultEntity } from '../domain/entities/Character'

import type { Character, SearchResult } from '../domain/entities/Character'
import type { ICharacterRepository } from '../domain/repositories/ICharacterRepository'

import { ApiError, NetworkError } from '@/shared/errors/AppError'

type ApiCharacterResponse = {
  id: string
  name: string
  description?: string
  image?: string
}

type ApiSearchResponse = {
  data: ApiCharacterResponse[]
  info: {
    total: number
    page: number
    limit: number
    next: string | null
    prev: string | null
  }
}

type CharacterFilter = {
  search?: string
  page?: number
  limit?: number
}

/**
 * HTTP client interface
 */
type HttpClient = {
  get: <T>(url: string, config?: { params?: Record<string, unknown> }) => Promise<T>
}

/**
 * API response structure
 */

/**
 * HTTP-based character repository implementation
 */
export class HttpCharacterRepository implements ICharacterRepository {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly baseUrl: string
  ) {}

  /**
   * Find character by ID
   */
  async getCharacter(id: string): Promise<Character | null> {
    try {
      const response = await this.httpClient.get<ApiCharacterResponse>(`${this.baseUrl}/people/${id}`)

      return CharacterEntity.fromApiResponse(response, 'people')
    } catch (error) {
      if (this.isNotFoundError(error)) {
        return null
      }
      throw this.mapError(error)
    }
  }

  /**
   * Search characters with parameters
   */
  async searchCharacters(filter: CharacterFilter): Promise<SearchResult> {
    const params = {
      endpoint: 'people',
      search: filter.search,
      page: filter.page ?? 1,
      limit: filter.limit ?? 10
    }

    try {
      const queryParams: Record<string, string> = {
        page: params.page.toString(),
        limit: params.limit.toString(),
      }

      if (params.search) {
        queryParams.search = params.search
      }

      const response = await this.httpClient.get<ApiSearchResponse>(`${this.baseUrl}/${params.endpoint}`, {
        params: queryParams,
      })

      // Transform API response to match SearchResult.fromApiResponse expectations
      const transformedResponse = {
        results: response.data,
        total: response.info.total,
        page: response.info.page,
        pages: Math.ceil(response.info.total / response.info.limit),
        count: response.data.length,
        limit: response.info.limit,
      }

      return SearchResultEntity.fromApiResponse(transformedResponse, params.endpoint)
    } catch (error) {
      throw this.mapError(error)
    }
  }

  /**
   * Get characters by endpoint with pagination
   */

  /**
   * Clear cache (no-op for HTTP repository)
   */
  clearCache(): void {
    // HTTP repository doesn't have cache to clear
  }

  /**
   * Check if error is 404 Not Found
   */
  private isNotFoundError(error: unknown): boolean {
    if (typeof error !== 'object' || error === null) {
      return false
    }

    const axiosError = error as { response?: { status?: number }, status?: number }

    return axiosError.response?.status === 404 || axiosError.status === 404
  }

  /**
   * Map HTTP errors to domain errors
   */
  private mapError(error: unknown): Error {
    if (typeof error !== 'object' || error === null) {
      return new NetworkError('Unknown network error')
    }

    const _error = error as {
      code?: string
      message?: string
      response?: {
        status?: number
        statusText?: string
      }
      status?: number
      config?: { url?: string }
      url?: string
    }

    if (_error.code === 'NETWORK_ERROR' || _error.message?.includes('fetch')) {
      return new NetworkError('Network request failed', _error)
    }

    const status = _error.response?.status || _error.status || 500
    const message = _error.response?.statusText || _error.message || 'Unknown API error'

    return new ApiError(`API request failed: ${message}`, status, {
      originalError: _error.message,
      url: _error.config?.url || _error.url,
    })
  }
}
