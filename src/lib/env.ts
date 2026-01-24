/**
 * Environment Variable Validation
 * 
 * Validates required environment variables at application startup
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

// Define the schema for environment variables
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  
  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().optional(),
  NEXT_PUBLIC_USE_SUPABASE: z.string().optional().transform(val => val === 'true'),
  
  // Feature Flags
  NEXT_PUBLIC_ENABLE_OAUTH: z.string().optional().transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_MONITORING: z.string().optional().transform(val => val === 'true'),
  NEXT_PUBLIC_ENABLE_EXPORT: z.string().optional().transform(val => val === 'true'),
  
  // Sentry Configuration (optional)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_ENVIRONMENT: z.string().optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.string().optional(),
  SENTRY_REPLAYS_SESSION_SAMPLE_RATE: z.string().optional(),
  SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE: z.string().optional(),
});

// Refined validation with custom error messages
const refinedEnvSchema = envSchema.refine(
  (data) => {
    // At least one API URL must be provided
    return data.NEXT_PUBLIC_API_URL || data.NEXT_PUBLIC_API_BASE_URL;
  },
  {
    message: 'Either NEXT_PUBLIC_API_URL or NEXT_PUBLIC_API_BASE_URL must be provided',
  }
).refine(
  (data) => {
    // If Supabase is enabled, URL and key must be provided
    if (data.NEXT_PUBLIC_USE_SUPABASE) {
      return data.NEXT_PUBLIC_SUPABASE_URL && data.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
    }
    return true;
  },
  {
    message: 'NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are required when NEXT_PUBLIC_USE_SUPABASE is true',
  }
);

// Type for validated environment variables
export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Throws an error if validation fails
 */
export function validateEnv(): Env {
  try {
    const env = refinedEnvSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formatted = error.issues.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      );
      
      throw new Error(
        `❌ Invalid environment variables:\n${formatted.join('\n')}\n\n` +
        `Please check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

/**
 * Get validated environment variables
 * Returns null if validation fails (safe version)
 */
export function getValidatedEnv(): Env | null {
  try {
    return validateEnv();
  } catch (error) {
    console.error(error);
    return null;
  }
}

/**
 * Check if environment is properly configured
 */
export function isEnvConfigured(): boolean {
  try {
    validateEnv();
    return true;
  } catch {
    return false;
  }
}

/**
 * Get a specific environment variable with type safety
 */
export function getEnvVar<K extends keyof Env>(key: K): Env[K] | undefined {
  const env = getValidatedEnv();
  return env ? env[key] : undefined;
}

// Validate environment on module load in development
if (process.env.NODE_ENV === 'development' && typeof window === 'undefined') {
  try {
    validateEnv();
    console.log('✅ Environment variables validated successfully');
  } catch (error) {
    console.error(error);
    // Don't throw in development, just warn
    console.warn('⚠️ Continuing with invalid environment configuration');
  }
}

// Export validated env for use in the app
let validatedEnv: Env | null = null;

try {
  validatedEnv = validateEnv();
} catch {
  // Env validation failed, but we'll allow the app to start
  // Individual services will handle missing configs gracefully
}

export const env = validatedEnv;
