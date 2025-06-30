import type { AppError } from '../errors/AppError'

/**
 * Logger interface for dependency injection
 */
export interface ILogger {
  error: (message: string, context?: Record<string, any>) => void
  warn: (message: string, context?: Record<string, any>) => void
  info: (message: string, context?: Record<string, any>) => void
  debug: (message: string, context?: Record<string, any>) => void
}

/**
 * Notification service interface
 */
export interface INotificationService {
  error: (message: string) => void
  warning: (message: string) => void
  success: (message: string) => void
  info: (message: string) => void
}

/**
 * Monitoring service interface for external error tracking
 */
export interface IMonitoringService {
  captureException: (error: Error | AppError) => void
  captureMessage: (message: string, level: 'error' | 'warning' | 'info') => void
  setContext: (context: Record<string, any>) => void
}

/**
 * Configuration for error handling behavior
 */
export interface ErrorHandlerConfig {
  showUserNotifications: boolean
  logToConsole: boolean
  sendToMonitoring: boolean
  retryableErrorCodes: string[]
  maxRetries: number
}

/**
 * Result of error handling with retry information
 */
export interface ErrorHandlingResult {
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
    retryableErrorCodes: ['NETWORK_ERROR', 'API_ERROR'],
    maxRetries: 3,
  }

  constructor (
    private readonly logger: ILogger,
    private readonly notificationService: INotificationService,
    private readonly monitoringService?: IMonitoringService,
    private readonly config: Partial<ErrorHandlerConfig> = {},
  ) {}

  /**
   * Main error handling method
   */
  handle (error: Error | AppError, context?: Record<string, any>): ErrorHandlingResult {
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
  createRetryHandler<T> (
    operation: () => Promise<T>,
    maxRetries = this.defaultConfig.maxRetries,
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
  private handleAppError (
    error: AppError,
    context: Record<string, any>,
    config: ErrorHandlerConfig,
  ): ErrorHandlingResult {
    // Log the error
    if (config.logToConsole) {
      this.logger.error(`[${error.code}] ${error.message}`, {
        code: error.code,
        statusCode: error.statusCode,
        context: error.context,
        additionalContext: context,
        stack: error.stack,
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
      userNotified,
    }
  }

  /**
   * Handle unknown/unexpected errors
   */
  private handleUnknownError (
    error: Error,
    context: Record<string, any>,
    config: ErrorHandlerConfig,
  ): ErrorHandlingResult {
    if (config.logToConsole) {
      this.logger.error('Unknown error occurred', {
        message: error.message,
        stack: error.stack,
        context,
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
      userNotified: config.showUserNotifications,
    }
  }

  /**
   * Handle critical errors that occur during error handling
   */
  private handleCriticalError (
    handlingError: Error,
    originalError: Error,
    context: Record<string, any>,
  ): void {
    console.error('Critical error in error handling:', {
      handlingError: handlingError.message,
      originalError: originalError.message,
      context,
    })

    // Try to send to monitoring as last resort
    try {
      this.monitoringService?.captureMessage(
        'Critical error in error handling',
        'error',
      )
    } catch {
      // Silent fail - nothing more we can do
    }
  }

  /**
   * Check if error is an AppError instance
   */
  private isAppError (error: Error | AppError): error is AppError {
    return 'code' in error && 'statusCode' in error && 'userMessage' in error
  }

  /**
   * Determine if an error should trigger a retry
   */
  private isRetryableError (error: AppError, config: ErrorHandlerConfig): boolean {
    return config.retryableErrorCodes.includes(error.code) && error.statusCode >= 500
  }

  /**
   * Calculate delay before retry based on error type
   */
  private calculateRetryDelay (error: AppError): number | undefined {
    switch (error.code) {
      case 'NETWORK_ERROR': {
        return 1000 // 1 second
      }
      case 'API_ERROR': {
        return error.statusCode === 429 ? 5000 : 2000 // Rate limit vs server error
      }
      default: {
        return undefined
      }
    }
  }

  /**
   * Enrich error context with additional information
   */
  private enrichContext (
    error: Error,
    additionalContext?: Record<string, any>,
  ): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator === 'undefined' ? 'unknown' : navigator.userAgent,
      url: typeof window === 'undefined' ? 'unknown' : window.location.href,
      errorName: error.name,
      errorMessage: error.message,
      ...additionalContext,
    }
  }

  /**
   * Utility method for delay
   */
  private delay (ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

/**
 * Console logger implementation
 */
export class ConsoleLogger implements ILogger {
  error (message: string, context?: Record<string, any>): void {
    console.error(message, context)
  }

  warn (message: string, context?: Record<string, any>): void {
    console.warn(message, context)
  }

  info (message: string, context?: Record<string, any>): void {
    console.info(message, context)
  }

  debug (message: string, context?: Record<string, any>): void {
    console.debug(message, context)
  }
}
