/**
 * Simple Dependency Injection Container
 */
export class Container {
  private readonly dependencies = new Map<string, any>()

  private readonly singletons = new Map<string, any>()

  private readonly singletonInstances = new Map<string, any>()

  /**
   * Register a dependency
   */
  register<T>(token: string, factory: () => T, singleton = false): void {
    if (singleton) {
      this.singletons.set(token, factory)
    } else {
      this.dependencies.set(token, factory)
    }
  }

  /**
   * Resolve a dependency
   */
  resolve<T>(token: string): T {
    // Check for singleton instance first
    if (this.singletonInstances.has(token)) {
      return this.singletonInstances.get(token)
    }

    // Check for singleton factory
    if (this.singletons.has(token)) {
      const factory = this.singletons.get(token)
      const instance = factory()

      this.singletonInstances.set(token, instance)

      return instance
    }

    // Check for regular dependency
    const factory = this.dependencies.get(token)

    if (!factory) {
      throw new Error(`Dependency '${token}' not found. Make sure it's registered.`)
    }

    return factory()
  }

  /**
   * Check if a dependency is registered
   */
  has(token: string): boolean {
    return this.dependencies.has(token) || this.singletons.has(token) || this.singletonInstances.has(token)
  }

  /**
   * Remove a dependency
   */
  unregister(token: string): void {
    this.dependencies.delete(token)
    this.singletons.delete(token)
    this.singletonInstances.delete(token)
  }

  /**
   * Clear all dependencies
   */
  clear(): void {
    this.dependencies.clear()
    this.singletons.clear()
    this.singletonInstances.clear()
  }

  /**
   * Get all registered tokens
   */
  getRegisteredTokens(): string[] {
    const tokens = new Set<string>()

    for (const token of this.dependencies.keys()) {
      tokens.add(token)
    }

    for (const token of this.singletons.keys()) {
      tokens.add(token)
    }

    for (const token of this.singletonInstances.keys()) {
      tokens.add(token)
    }

    return Array.from(tokens)
  }
}

/**
 * Dependency injection tokens
 */
export const TOKENS = {
  // Repositories
  CHARACTER_REPOSITORY: 'ICharacterRepository',
  CACHE_REPOSITORY: 'ICacheRepository',

  // Services
  HTTP_CLIENT: 'HttpClient',
  CONFIG_SERVICE: 'ConfigService',
  ERROR_HANDLER: 'ErrorHandlerService',
  LOGGER: 'ILogger',
  NOTIFICATION_SERVICE: 'INotificationService',

  // Infrastructure
  API_BASE_URL: 'ApiBaseUrl',
  IMAGE_BASE_URL: 'ImageBaseUrl',
} as const

/**
 * Global container instance
 */
export const container = new Container()

/**
 * Helper function to inject dependencies into Vue components or composables
 */
export function inject<T>(token: string): T {
  return container.resolve<T>(token)
}

/**
 * Helper function to provide dependencies (usually called in setup functions)
 */
export function provide<T>(token: string, factory: () => T, singleton = false): void {
  container.register(token, factory, singleton)
}

/**
 * Helper type for inferring token types
 */
export type TokenType<T extends keyof typeof TOKENS> = (typeof TOKENS)[T]
