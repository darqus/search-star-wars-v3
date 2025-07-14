import { AppError } from '../errors/AppError'

/**
 * Logger interface for dependency injection
 */
export type ILogger = {
  error: (message: string, context?: Record<string, unknown>) => void
  warn: (message: string, context?: Record<string, unknown>) => void
  info: (message: string, context?: Record<string, unknown>) => void
  debug: (message: string, context?: Record<string, unknown>) => void
}

/**
 * Notification service interface
 */
export type INotificationService = {
  error: (message: string) => void
  warning: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
}

/**
 * Monitoring service interface for external error tracking
 */
export type IMonitoringService = {
  captureException: (error: Error | AppError) => void
  captureMessage: (message: string, level: 'error' | 'warning' | 'info') => void
  setContext: (context: Record<string, unknown>) => void
}

/**
 * Configuration for error handling behavior
 */
export type ErrorHandlerConfig = {
  showUserNotifications: boolean
  logToConsole: boolean
  sendToMonitoring: boolean
  retryableErrorCodes: string[]
  maxRetries: number
}

/**
 * Result of error handling with retry information
 */
export type ErrorHandlingResult = {
  handled: boolean
  shouldRetry: boolean
  retryAfter?: number
  userNotified: boolean
}

/**
 * Centralized error handling service
 */
export class ErrorHandlerService {
  private readonly defaultConfig: ErrorHandlerConfig = {
    showUserNotifications: true,
    logToConsole: true,
    sendToMonitoring: true,
    retryableErrorCodes: [ 'NETWORK_ERROR', 'API_ERROR' ],
    maxRetries: 3,
  }

  constructor(
    private readonly logger: ILogger,
    private readonly notificationService: INotificationService,
    private readonly monitoringService?: IMonitoringService,
    private readonly config: Partial<ErrorHandlerConfig> = {}
  ) {}

  /**
   * Main error handling method
   */
  handle(error: Error | AppError, context?: Record<string, unknown>): ErrorHandlingResult {
    const finalConfig = { ...this.defaultConfig, ...this.config }
    const errorContext = this.enrichContext(error, context)

    try {
      return this.isAppError(error)
        ? this.handleAppError(error, errorContext, finalConfig)
        : this.handleUnknownError(error, errorContext, finalConfig)
    } catch (handlingError) {
      // Fallback if error handling itself fails
      this.handleCriticalError(handlingError as Error, error, errorContext)

      return {
        handled: false,
        shouldRetry: false,
        userNotified: false,
      }
    }
  }

  /**
   * Create a retry function for retryable errors
   */
  createRetryHandler<T>(
    operation: () => Promise<T>,
    maxRetries = this.defaultConfig.maxRetries
  ): (error: AppError) => Promise<T> {
    return async (error: AppError): Promise<T> => {
      let retries = 0

      while (retries < maxRetries) {
        try {
          return await operation()
        } catch (retryError) {
          retries++

          const result = this.handle(retryError as AppError, { retryAttempt: retries })

          if (!result.shouldRetry || retries >= maxRetries) {
            throw retryError
          }

          if (result.retryAfter) {
            await this.delay(result.retryAfter)
          }
        }
      }

      throw error
    }
  }

  /**
   * Handle application-specific errors
   */
  private handleAppError(
    error: AppError,
    context: Record<string, unknown>,
    config: ErrorHandlerConfig
  ): ErrorHandlingResult {
    // Log the error
    if (config.logToConsole) {
      this.logger.error(`[${error.code}] ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        additionalContext: context,
        stack: error.stack
      })
    }

    // Show user notification
    let userNotified = false

    if (config.showUserNotifications) {
      this.notificationService.error(error.userMessage)
      userNotified = true
    }

    // Send to monitoring
    if (config.sendToMonitoring && this.monitoringService) {
      this.monitoringService.setContext(context)
      this.monitoringService.captureException(error)
    }

    // Determine if error is retryable
    const shouldRetry = this.isRetryableError(error, config)
    const retryAfter = this.calculateRetryDelay(error)

    return {
      handled: true,
      shouldRetry,
      retryAfter,
      userNotified
    }
  }

  private handleUnknownError(
    error: Error,
    context: Record<string, unknown>,
    config: ErrorHandlerConfig
  ): ErrorHandlingResult {
    if (config.logToConsole) {
      this.logger.error('Unknown error occurred', {
        message: error.message,
        stack: error.stack,
        context
      })
    }

    if (config.showUserNotifications) {
      this.notificationService.error('Произошла неожиданная ошибка. Попробуйте обновить страницу.')
    }

    if (config.sendToMonitoring && this.monitoringService) {
      this.monitoringService.setContext(context)
      this.monitoringService.captureException(error)
    }

    return {
      handled: true,
      shouldRetry: false,
      userNotified: config.showUserNotifications
    }
  }

  private handleCriticalError(
    handlingError: Error,
    originalError: Error,
    context: Record<string, unknown>
  ): void {
    try {
      this.logger.error('Critical error in error handling', {
        handlingError: handlingError.message,
        originalError: originalError.message,
        context
      })
      this.monitoringService?.captureMessage('Critical error in error handling', 'error')
    } catch {
      console.error('Fatal error in error handler', {
        handlingError: handlingError.message,
        originalError: originalError.message,
        context
      })
    }
  }

  private isAppError(error: Error | AppError): error is AppError {
    return error instanceof AppError
  }

  private isRetryableError(error: AppError, config: ErrorHandlerConfig): boolean {
    return config.retryableErrorCodes.includes(error.code) && error.statusCode >= 500
  }

  private calculateRetryDelay(error: AppError): number | undefined {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 1000

      case 'API_ERROR':
        return error.statusCode === 429 ? 5000 : 2000

      default:
        return undefined
    }
  }

  private enrichContext(
    error: Error,
    additionalContext?: Record<string, unknown>
  ): Record<string, unknown> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
      url: typeof window === 'undefined' ? 'unknown' : window.location.href,
      errorName: error.name,
      errorMessage: error.message,
      ...additionalContext
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
