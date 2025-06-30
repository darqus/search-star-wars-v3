/**
 * Базовый класс для всех ошибок приложения
 */
export abstract class AppError extends Error {
  abstract readonly code: string
  abstract readonly statusCode: number
  abstract readonly userMessage: string

  constructor (
    message: string,
    public readonly context?: Record<string, any>,
    public readonly cause?: Error,
  ) {
    super(message)
    this.name = this.constructor.name

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /**
   * Serialize error for logging/monitoring
   */
  toJSON () {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      userMessage: this.userMessage,
      statusCode: this.statusCode,
      context: this.context,
      stack: this.stack,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Create error with additional context
   */
  withContext (context: Record<string, any>): this {
    return new (this.constructor as any)(
      this.message,
      { ...this.context, ...context },
      this.cause,
    )
  }
}

/**
 * Domain-specific errors
 */
export class ValidationError extends AppError {
  readonly code = 'VALIDATION_ERROR'
  readonly statusCode = 400
  readonly userMessage = 'Введенные данные некорректны'

  constructor (message: string, context?: Record<string, any>) {
    super(message, context)
  }
}

export class NotFoundError extends AppError {
  readonly code = 'NOT_FOUND'
  readonly statusCode = 404
  readonly userMessage = 'Запрашиваемый ресурс не найден'
}

export class ApiError extends AppError {
  readonly code = 'API_ERROR'
  readonly statusCode: number
  readonly userMessage = 'Произошла ошибка при загрузке данных. Попробуйте еще раз.'

  constructor (message: string, statusCode = 500, context?: Record<string, any>) {
    super(message, context)
    this.statusCode = statusCode
  }
}

export class NetworkError extends AppError {
  readonly code = 'NETWORK_ERROR'
  readonly statusCode = 0
  readonly userMessage = 'Проблемы с сетевым соединением. Проверьте подключение к интернету.'
}

export class CacheError extends AppError {
  readonly code = 'CACHE_ERROR'
  readonly statusCode = 500
  readonly userMessage = 'Ошибка кэширования данных'
}

/**
 * Character domain specific errors
 */
export class CharacterNotFoundError extends AppError {
  readonly code = 'CHARACTER_NOT_FOUND'
  readonly statusCode = 404
  readonly userMessage = 'Персонаж не найден'

  constructor (characterId: string) {
    super(`Character with ID ${characterId} not found`, { characterId })
  }
}

export class InvalidSearchTermError extends AppError {
  readonly code = 'INVALID_SEARCH_TERM'
  readonly statusCode = 400
  readonly userMessage = 'Поисковый запрос должен содержать минимум 3 символа'

  constructor (term: string) {
    super(`Invalid search term: ${term}`, { term, minLength: 3 })
  }
}

export class ImageLoadError extends AppError {
  readonly code = 'IMAGE_LOAD_ERROR'
  readonly statusCode = 500
  readonly userMessage = 'Не удалось загрузить изображение'

  constructor (imageUrl: string, cause?: Error) {
    super(`Failed to load image: ${imageUrl}`, { imageUrl }, cause)
  }
}

/**
 * Error factory for creating specific error types
 */
export const ErrorFactory = {
  createApiError (response: Response): ApiError {
    return new ApiError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      {
        url: response.url,
        status: response.status,
        statusText: response.statusText,
      },
    )
  },

  createNetworkError (originalError: Error): NetworkError {
    return new NetworkError(
      'Network request failed',
      { originalMessage: originalError.message },
      originalError,
    )
  },

  createValidationError (field: string, value: any, rule: string): ValidationError {
    return new ValidationError(
      `Validation failed for field ${field}`,
      { field, value, rule },
    )
  },
}
