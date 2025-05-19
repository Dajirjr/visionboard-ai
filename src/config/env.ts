interface EnvConfig {
  ENABLE_BETA: boolean
  OPENAI_API_KEY: string | undefined
  API_URL: string
}

export const env: EnvConfig = {
  ENABLE_BETA: import.meta.env.VITE_ENABLE_BETA === 'true',
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
}

// Type-safe environment helper
export function getEnvVar(key: keyof EnvConfig): EnvConfig[keyof EnvConfig] {
  return env[key]
}

// Check if beta features are enabled
export function isBetaEnabled(): boolean {
  return env.ENABLE_BETA
}

// Validate required environment variables
export function validateEnv(): void {
  const required = ['OPENAI_API_KEY']
  const missing = required.filter(key => !env[key as keyof EnvConfig])
  
  if (missing.length > 0) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`)
  }
} 