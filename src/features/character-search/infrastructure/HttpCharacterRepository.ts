import { Character as CharacterEntity, SearchResult as SearchResultEntity } from '../domain/entities/Character'

import type { Character, SearchResult } from '../domain/entities/Character'
import type { ICharacterRepository, SearchParams } from '../domain/repositories/ICharacterRepository'

import { ApiError, NetworkError } from '@/shared/errors/AppError'

/**
 * HTTP client interface
 */
type HttpClient = {
  get: <T>(url: string, config?: { params?: Record<string, any> }) => Promise<T>
}

/**
 * API response structure
 */
type ApiResponse = {
  data: any[]
  info: {
    total: number
    page: number
    limit: number
    next: string | null
    prev: string | null
  }
}

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
  async findById(id: string, endpoint: string): Promise<Character | null> {
    try {
      const response = await this.httpClient.get<any>(`${this.baseUrl}/${endpoint}/${id}`)

      return CharacterEntity.fromApiResponse(response, endpoint)
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
  async search(params: SearchParams): Promise<SearchResult> {
    try {
      const queryParams: Record<string, any> = {
        page: params.page.toString(),
        limit: params.limit.toString(),
      }

      if (params.search) {
        queryParams.search = params.search
      }

      const response = await this.httpClient.get<ApiResponse>(`${this.baseUrl}/${params.endpoint}`, {
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
  async findByEndpoint(endpoint: string, page: number, limit: number): Promise<SearchResult> {
    return this.search({ endpoint, page, limit })
  }

  /**
   * Clear cache (no-op for HTTP repository)
   */
  clearCache(): void {
    // HTTP repository doesn't have cache to clear
  }

  /**
   * Check if error is 404 Not Found
   */
  private isNotFoundError(error: any): boolean {
    return error?.response?.status === 404 || error?.status === 404
  }

  /**
   * Map HTTP errors to domain errors
   */
  private mapError(error: any): Error {
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('fetch')) {
      return new NetworkError('Network request failed', error)
    }

    const status = error?.response?.status || error?.status || 500
    const message = error?.response?.statusText || error?.message || 'Unknown API error'

    return new ApiError(`API request failed: ${message}`, status, {
      originalError: error?.message,
      url: error?.config?.url || error?.url,
    })
  }
}
