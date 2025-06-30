import { configService } from '@/shared/config/ConfigService'
import { container, TOKENS } from '@/shared/di/Container'
import { ConsoleLogger } from '@/shared/services/ErrorHandlerService'

import { BrowserCacheRepository } from '../infrastructure/BrowserCacheRepository'
import { CachedCharacterRepository } from '../infrastructure/CachedCharacterRepository'
import { HttpCharacterRepository } from '../infrastructure/HttpCharacterRepository'
import { HttpClient } from '../infrastructure/HttpClient'

/**
 * Setup dependency injection for character search feature
 */
export function setupCharacterSearchDI (): void {
  // Configuration
  const apiConfig = configService.getApiConfig()
  const cacheConfig = configService.getCacheConfig()

  // Register HTTP Client
  container.register(
    TOKENS.HTTP_CLIENT,
    () => new HttpClient({
      timeout: apiConfig.timeout,
      retries: apiConfig.retries,
    }),
    true, // singleton
  )

  // Register Cache Repository
  container.register(
    TOKENS.CACHE_REPOSITORY,
    () => new BrowserCacheRepository({
      enabled: cacheConfig.enabled,
      defaultTtl: cacheConfig.ttl,
      maxSize: cacheConfig.maxSize,
    }),
    true, // singleton
  )

  // Register Logger
  container.register(
    TOKENS.LOGGER,
    () => new ConsoleLogger(),
    true, // singleton
  )

  // Register HTTP Character Repository
  container.register(
    'HttpCharacterRepository',
    () => {
      const httpClient = container.resolve<HttpClient>(TOKENS.HTTP_CLIENT)
      return new HttpCharacterRepository(httpClient, apiConfig.baseUrl)
    },
    true, // singleton
  )

  // Register Cached Character Repository (main repository)
  container.register(
    TOKENS.CHARACTER_REPOSITORY,
    () => {
      const httpRepository = container.resolve<HttpCharacterRepository>('HttpCharacterRepository')
      const cacheRepository = container.resolve<BrowserCacheRepository>(TOKENS.CACHE_REPOSITORY)

      return new CachedCharacterRepository(
        httpRepository,
        cacheRepository,
        {
          characterTtl: cacheConfig.ttl,
          searchTtl: cacheConfig.ttl / 5, // Shorter TTL for search results
          enabled: cacheConfig.enabled,
        },
      )
    },
    true, // singleton
  )

  // Register API URLs for easy access
  container.register(
    TOKENS.API_BASE_URL,
    () => apiConfig.baseUrl,
    true,
  )

  container.register(
    TOKENS.IMAGE_BASE_URL,
    () => apiConfig.imageBaseUrl,
    true,
  )
}

/**
 * Cleanup function to clear dependencies (useful for testing)
 */
export function cleanupCharacterSearchDI (): void {
  const tokensToCleanup = [
    TOKENS.HTTP_CLIENT,
    TOKENS.CACHE_REPOSITORY,
    TOKENS.LOGGER,
    'HttpCharacterRepository',
    TOKENS.CHARACTER_REPOSITORY,
    TOKENS.API_BASE_URL,
    TOKENS.IMAGE_BASE_URL,
  ]

  for (const token of tokensToCleanup) {
    container.unregister(token)
  }
}

/**
 * Get character repository from DI container
 */
export function getCharacterRepository (): HttpCharacterRepository {
  return container.resolve<HttpCharacterRepository>(TOKENS.CHARACTER_REPOSITORY)
}

/**
 * Get cache repository from DI container
 */
export function getCacheRepository (): BrowserCacheRepository {
  return container.resolve<BrowserCacheRepository>(TOKENS.CACHE_REPOSITORY)
}

/**
 * Check if DI is properly setup
 */
export function isCharacterSearchDISetup (): boolean {
  const requiredTokens = [
    TOKENS.HTTP_CLIENT,
    TOKENS.CACHE_REPOSITORY,
    TOKENS.CHARACTER_REPOSITORY,
  ]

  return requiredTokens.every(token => container.has(token))
}
