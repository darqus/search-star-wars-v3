/**
 * Application configuration interface
 */
export type AppConfig = {
  api: {
    baseUrl: string
    imageBaseUrl: string
    timeout: number
    retries: number
  }
  cache: {
    enabled: boolean
    ttl: number
    maxSize: number
  }
  features: {
    darkMode: boolean
    search: boolean
    analytics: boolean
    offlineMode: boolean
  }
  ui: {
    pagination: {
      defaultPageSize: number
      maxPageSize: number
    }
    search: {
      minLength: number
      debounceDelay: number
      dropdownDelay: number
      resultsLimit: number
    }
    animation: {
      componentDelayFast: number
      componentDelayMedium: number
      transitionDuration: number
    }
  }
  development: {
    enableDevtools: boolean
    enableErrorOverlay: boolean
    logLevel: 'debug' | 'info' | 'warn' | 'error'
  }
}

/**
 * Environment validation error
 */
export class ConfigValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly value: unknown
  ) {
    super(message)
    this.name = 'ConfigValidationError'
  }
}

/**
 * Configuration service for managing application settings
 */
export class ConfigService {
  private config: AppConfig

  private readonly requiredEnvVars = [ 'VITE_APP_API_BASE_URL', 'VITE_APP_IMAGE_BASE_URL' ]

  constructor() {
    this.config = this.loadAndValidateConfig()
  }

  /**
   * Get the full configuration
   */
  getConfig(): AppConfig {
    return { ...this.config }
  }

  /**
   * Get a specific configuration section
   */
  get<K extends keyof AppConfig>(key: K): AppConfig[K] {
    return this.config[key]
  }

  /**
   * Get API configuration
   */
  getApiConfig() {
    return this.config.api
  }

  /**
   * Get cache configuration
   */
  getCacheConfig() {
    return this.config.cache
  }

  /**
   * Get UI configuration
   */
  getUiConfig() {
    return this.config.ui
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
    return this.config.features[feature]
  }

  /**
   * Check if development mode is enabled
   */
  isDevelopment(): boolean {
    return import.meta.env.DEV
  }

  /**
   * Check if production mode is enabled
   */
  isProduction(): boolean {
    return import.meta.env.PROD
  }

  /**
   * Get environment name
   */
  getEnvironment(): string {
    return import.meta.env.MODE || 'development'
  }

  /**
   * Get build version if available
   */
  getVersion(): string {
    return import.meta.env.VITE_APP_VERSION ?? 'unknown'
  }

  /**
   * Update configuration at runtime (for testing/development)
   */
  updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates }
    this.validateConfig(this.config)
  }

  /**
   * Get configuration as JSON string for debugging
   */
  toJSON(): string {
    // Remove sensitive information before serializing
    const safeConfig = {
      ...this.config,
      api: {
        ...this.config.api,

        // You might want to mask URLs in production
        baseUrl: this.isProduction() ? '***' : this.config.api.baseUrl,
        imageBaseUrl: this.isProduction() ? '***' : this.config.api.imageBaseUrl,
      },
    }

    return JSON.stringify(safeConfig, null, 2)
  }

  /**
   * Load and validate configuration from environment variables
   */
  private loadAndValidateConfig(): AppConfig {
    // Validate required environment variables first
    this.validateRequiredEnvVars()

    const config: AppConfig = {
      api: {
        baseUrl: this.getRequiredEnv('VITE_APP_API_BASE_URL'),
        imageBaseUrl: this.getRequiredEnv('VITE_APP_IMAGE_BASE_URL'),
        timeout: this.getNumberEnv('VITE_API_TIMEOUT', 10_000),
        retries: this.getNumberEnv('VITE_API_RETRIES', 3),
      },
      cache: {
        enabled: this.getBooleanEnv('VITE_CACHE_ENABLED', true),
        ttl: this.getNumberEnv('VITE_CACHE_TTL', 300_000), // 5 minutes
        maxSize: this.getNumberEnv('VITE_CACHE_MAX_SIZE', 100),
      },
      features: {
        darkMode: this.getBooleanEnv('VITE_FEATURE_DARK_MODE', true),
        search: this.getBooleanEnv('VITE_FEATURE_SEARCH', true),
        analytics: this.getBooleanEnv('VITE_FEATURE_ANALYTICS', false),
        offlineMode: this.getBooleanEnv('VITE_FEATURE_OFFLINE', false),
      },
      ui: {
        pagination: {
          defaultPageSize: this.getNumberEnv('VITE_UI_PAGE_SIZE', 20),
          maxPageSize: this.getNumberEnv('VITE_UI_MAX_PAGE_SIZE', 100),
        },
        search: {
          minLength: this.getNumberEnv('VITE_UI_SEARCH_MIN_LENGTH', 3),
          debounceDelay: this.getNumberEnv('VITE_UI_SEARCH_DEBOUNCE', 500),
          dropdownDelay: this.getNumberEnv('VITE_UI_SEARCH_DROPDOWN_DELAY', 200),
          resultsLimit: this.getNumberEnv('VITE_UI_SEARCH_RESULTS_LIMIT', 5),
        },
        animation: {
          componentDelayFast: this.getNumberEnv('VITE_UI_COMPONENT_DELAY_FAST', 100),
          componentDelayMedium: this.getNumberEnv('VITE_UI_COMPONENT_DELAY_MEDIUM', 200),
          transitionDuration: this.getNumberEnv('VITE_UI_TRANSITION_DURATION', 300),
        },
      },
      development: {
        enableDevtools: this.getBooleanEnv('VITE_DEV_ENABLE_DEVTOOLS', import.meta.env.DEV),
        enableErrorOverlay: this.getBooleanEnv('VITE_DEV_ERROR_OVERLAY', import.meta.env.DEV),
        logLevel: this.getStringEnv('VITE_DEV_LOG_LEVEL', 'info') as 'debug' | 'info' | 'warn' | 'error',
      },
    }

    this.validateConfig(config)

    return config
  }

  /**
   * Validate that all required environment variables are present
   */
  private validateRequiredEnvVars(): void {
    const missingVars = this.requiredEnvVars.filter((varName) => {
      const value = import.meta.env[varName]

      return !value || value.trim() === ''
    })

    if (missingVars.length > 0) {
      throw new ConfigValidationError(
        `Missing required environment variables: ${missingVars.join(', ')}`,
        'requiredEnvVars',
        missingVars
      )
    }
  }

  /**
   * Get required environment variable
   */
  private getRequiredEnv(key: string): string {
    const value = import.meta.env[key]

    if (!value || value.trim() === '') {
      throw new ConfigValidationError(`Required environment variable ${key} is not set or empty`, key, value)
    }

    return value.trim()
  }

  /**
   * Get optional string environment variable with default
   */
  private getStringEnv(key: string, defaultValue: string): string {
    const value = import.meta.env[key]

    return value ? value.trim() : defaultValue
  }

  /**
   * Get number environment variable with default
   */
  private getNumberEnv(key: string, defaultValue: number): number {
    const value = import.meta.env[key]

    if (!value) {
      return defaultValue
    }

    const parsed = Number(value)

    if (Number.isNaN(parsed)) {
      throw new ConfigValidationError(`Environment variable ${key} must be a valid number, got: ${value}`, key, value)
    }

    return parsed
  }

  /**
   * Get boolean environment variable with default
   */
  private getBooleanEnv(key: string, defaultValue: boolean): boolean {
    const value = import.meta.env[key]

    if (!value) {
      return defaultValue
    }

    const lowerValue = value.toLowerCase().trim()

    if (lowerValue === 'true' || lowerValue === '1') {
      return true
    }
    if (lowerValue === 'false' || lowerValue === '0') {
      return false
    }

    throw new ConfigValidationError(
      `Environment variable ${key} must be a boolean (true/false/1/0), got: ${value}`,
      key,
      value
    )
  }

  /**
   * Validate configuration values
   */
  private validateConfig(config: AppConfig): void {
    // Validate API URLs
    if (!this.isValidUrl(config.api.baseUrl)) {
      throw new ConfigValidationError('API base URL must be a valid HTTP/HTTPS URL', 'api.baseUrl', config.api.baseUrl)
    }

    if (!this.isValidUrl(config.api.imageBaseUrl)) {
      throw new ConfigValidationError(
        'Image base URL must be a valid HTTP/HTTPS URL',
        'api.imageBaseUrl',
        config.api.imageBaseUrl
      )
    }

    // Validate positive numbers
    if (config.api.timeout <= 0) {
      throw new ConfigValidationError('API timeout must be greater than 0', 'api.timeout', config.api.timeout)
    }

    if (config.api.retries < 0) {
      throw new ConfigValidationError('API retries must be non-negative', 'api.retries', config.api.retries)
    }

    if (config.cache.ttl < 0) {
      throw new ConfigValidationError('Cache TTL must be non-negative', 'cache.ttl', config.cache.ttl)
    }

    if (config.cache.maxSize <= 0) {
      throw new ConfigValidationError('Cache max size must be greater than 0', 'cache.maxSize', config.cache.maxSize)
    }

    // Validate UI settings
    if (config.ui.pagination.defaultPageSize <= 0) {
      throw new ConfigValidationError(
        'Default page size must be greater than 0',
        'ui.pagination.defaultPageSize',
        config.ui.pagination.defaultPageSize
      )
    }

    if (config.ui.pagination.maxPageSize < config.ui.pagination.defaultPageSize) {
      throw new ConfigValidationError(
        'Max page size must be greater than or equal to default page size',
        'ui.pagination.maxPageSize',
        config.ui.pagination.maxPageSize
      )
    }

    if (config.ui.search.minLength <= 0) {
      throw new ConfigValidationError(
        'Search minimum length must be greater than 0',
        'ui.search.minLength',
        config.ui.search.minLength
      )
    }

    // Validate log level
    const validLogLevels = [ 'debug', 'info', 'warn', 'error' ]

    if (!validLogLevels.includes(config.development.logLevel)) {
      throw new ConfigValidationError(
        `Log level must be one of: ${validLogLevels.join(', ')}`,
        'development.logLevel',
        config.development.logLevel
      )
    }
  }

  /**
   * Check if a string is a valid URL
   */
  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString)

      return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
      return false
    }
  }
}

// Export a singleton instance
export const configService = new ConfigService()

// Export individual configuration getters for convenience
export const getApiConfig = () => configService.getApiConfig()

export const getCacheConfig = () => configService.getCacheConfig()

export const getUiConfig = () => configService.getUiConfig()

export const isFeatureEnabled = (feature: keyof AppConfig['features']) => configService.isFeatureEnabled(feature)

export const isDevelopment = () => configService.isDevelopment()

export const isProduction = () => configService.isProduction()
