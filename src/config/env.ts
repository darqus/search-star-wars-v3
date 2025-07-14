type EnvConfig = {
  API_BASE_URL: string
  APP_NAME: string
  APP_VERSION: string
  BUILD_DATE: string
  IS_PRODUCTION: boolean
}

export const env: EnvConfig = {
  API_BASE_URL: import.meta.env.VITE_APP_API_BASE_URL ?? '',
  APP_NAME: import.meta.env.VITE_APP_NAME ?? 'Star Wars Search',
  APP_VERSION: import.meta.env.VITE_APP_VERSION ?? '1.0.0',
  BUILD_DATE: import.meta.env.VITE_APP_BUILD_DATE ?? new Date().toISOString().split('T')[0],
  IS_PRODUCTION: import.meta.env.PROD,
}

export const validateEnv = (): void => {
  const requiredVars = [ 'API_BASE_URL' ] as const

  for (const varName of requiredVars) {
    if (!env[varName]) {
      throw new Error(`Missing required environment variable: VITE_APP_${varName}`)
    }
  }
}
