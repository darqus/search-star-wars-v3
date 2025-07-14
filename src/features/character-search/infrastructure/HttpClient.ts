import { ApiError, NetworkError } from '@/shared/errors/AppError'

/**
 * HTTP client configuration
 */
type HttpClientConfig = {
  timeout: number
  retries: number
  baseURL?: string
}

/**
 * Request configuration
 */
type RequestConfig = {
  params?: Record<string, any>
  headers?: Record<string, string>
  timeout?: number
}

/**
 * Simple HTTP client implementation
 */
export class HttpClient {
  private readonly config: HttpClientConfig

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: config.timeout || 10_000,
      retries: config.retries || 3,
      baseURL: config.baseURL,
    }
  }

  /**
   * Perform GET request
   */
  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', url, undefined, config)
  }

  /**
   * Perform POST request
   */
  async post<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', url, data, config)
  }

  /**
   * Perform PUT request
   */
  async put<T>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', url, data, config)
  }

  /**
   * Perform DELETE request
   */
  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', url, undefined, config)
  }

  /**
   * Generic request method with retry logic
   */
  private async request<T>(method: string, url: string, data?: any, config?: RequestConfig): Promise<T> {
    let lastError: Error

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const response = await this.performRequest<T>(method, url, data, config)

        return response
      } catch (error) {
        lastError = error as Error

        // Don't retry client errors (4xx)
        if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
          throw error
        }

        // Don't retry on last attempt
        if (attempt === this.config.retries) {
          break
        }

        // Exponential backoff delay
        const delay = Math.min(1000 * Math.pow(2, attempt), 10_000)

        await this.sleep(delay)
      }
    }

    throw lastError!
  }

  /**
   * Perform the actual HTTP request
   */
  private async performRequest<T>(method: string, url: string, data?: any, config?: RequestConfig): Promise<T> {
    const fullUrl = this.buildUrl(url, config?.params)
    const requestConfig = this.buildRequestConfig(method, data, config)

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), config?.timeout || this.config.timeout)

      const response = await fetch(fullUrl, {
        ...requestConfig,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new ApiError(`HTTP ${response.status}: ${response.statusText}`, response.status, {
          url: fullUrl,
          method,
          status: response.status,
          statusText: response.statusText,
        })
      }

      const responseData = await response.json()

      return responseData as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout', error)
        }

        if (error.message.includes('fetch')) {
          throw new NetworkError('Network request failed', error)
        }
      }

      throw new ApiError('Unknown error occurred', 500, {
        originalError: error,
        url: fullUrl,
        method,
      })
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    let fullUrl = this.config.baseURL ? `${this.config.baseURL}${url}` : url

    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams()

      for (const [ key, value ] of Object.entries(params)) {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      }

      const queryString = searchParams.toString()

      if (queryString) {
        fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`
      }
    }

    return fullUrl
  }

  /**
   * Build fetch request configuration
   */
  private buildRequestConfig(method: string, data?: any, config?: RequestConfig): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...config?.headers,
    }

    const requestConfig: RequestInit = {
      method,
      headers,
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      requestConfig.body = JSON.stringify(data)
    }

    return requestConfig
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
