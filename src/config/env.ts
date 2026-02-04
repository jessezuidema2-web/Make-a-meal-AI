// Environment Variable Validation
// This ensures all required environment variables are present and valid

import Constants from 'expo-constants';

interface EnvVars {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
}

// Helper to get env variable from multiple sources
function getEnvVariable(name: string): string | undefined {
  // Try process.env first (works in Node.js and with dotenv)
  const fromProcessEnv = process.env[name];
  if (fromProcessEnv) return fromProcessEnv;

  // Try expo-constants extra (works in Expo apps)
  const expoExtra = Constants.expoConfig?.extra;
  if (expoExtra) {
    // Try with EXPO_PUBLIC_ prefix removed (stored in extra)
    const keyWithoutPrefix = name.replace('EXPO_PUBLIC_', '');
    // Convert SUPABASE_URL -> supabaseUrl, SUPABASE_ANON_KEY -> supabaseAnonKey
    const camelCaseKey = keyWithoutPrefix
      .toLowerCase()
      .replace(/_([a-z])/g, (_, char) => char.toUpperCase());
    if (expoExtra[camelCaseKey]) return expoExtra[camelCaseKey];

    // Also try direct key lookup (app.config.js uses supabaseUrl, supabaseAnonKey)
    if (name === 'EXPO_PUBLIC_SUPABASE_URL' && expoExtra.supabaseUrl) {
      return expoExtra.supabaseUrl;
    }
    if (name === 'EXPO_PUBLIC_SUPABASE_ANON_KEY' && expoExtra.supabaseAnonKey) {
      return expoExtra.supabaseAnonKey;
    }
  }

  return undefined;
}

class EnvironmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentError';
  }
}

function validateEnvVar(name: string, value: string | undefined, required: boolean = true): string {
  if (!value || value.trim() === '') {
    if (required) {
      console.error(
        `Missing required environment variable: ${name}\n` +
        `Please create a .env file with all required variables.\n` +
        `See .env.example for reference.`
      );
    }
    return '';
  }
  return value.trim();
}

function validateUrl(name: string, url: string): void {
  try {
    new URL(url);
  } catch {
    throw new EnvironmentError(
      `Invalid URL format for ${name}: ${url}\n` +
      `Expected a valid HTTPS URL.`
    );
  }

  if (!url.startsWith('https://')) {
    console.warn(`Warning: ${name} should use HTTPS in production`);
  }
}

function validateSupabaseKey(key: string, keyType: 'anon' | 'service'): void {
  // Basic validation - Supabase keys are JWT tokens
  const parts = key.split('.');
  if (parts.length !== 3) {
    throw new EnvironmentError(
      `Invalid Supabase ${keyType} key format.\n` +
      `Expected a JWT token with 3 parts separated by dots.`
    );
  }

  // Check if it's base64-encoded (basic check)
  const base64Regex = /^[A-Za-z0-9_-]+$/;
  if (!parts.every(part => base64Regex.test(part))) {
    throw new EnvironmentError(
      `Invalid Supabase ${keyType} key format.\n` +
      `Key parts should be base64-encoded.`
    );
  }
}

function getEnvVars(): EnvVars {
  // Expo uses EXPO_PUBLIC_ prefix for public env vars
  const supabaseUrl = validateEnvVar(
    'EXPO_PUBLIC_SUPABASE_URL',
    getEnvVariable('EXPO_PUBLIC_SUPABASE_URL')
  );

  const supabaseAnonKey = validateEnvVar(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    getEnvVariable('EXPO_PUBLIC_SUPABASE_ANON_KEY')
  );

  // Validate formats only if values exist
  if (supabaseUrl) {
    validateUrl('EXPO_PUBLIC_SUPABASE_URL', supabaseUrl);
  }
  if (supabaseAnonKey) {
    validateSupabaseKey(supabaseAnonKey, 'anon');
  }

  // Optional: Stripe key (only needed when payments are implemented)
  const stripePublishableKey = getEnvVariable('EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY');
  if (stripePublishableKey && !stripePublishableKey.startsWith('pk_')) {
    console.warn('Warning: Stripe publishable key should start with "pk_"');
  }

  return {
    supabaseUrl: supabaseUrl || '',
    supabaseAnonKey: supabaseAnonKey || '',
    stripePublishableKey,
  };
}

// Validate and export - never throw during module initialization
let envVars: EnvVars;

try {
  envVars = getEnvVars();
  if (envVars.supabaseUrl && envVars.supabaseAnonKey) {
    console.log('Environment variables loaded successfully');
  } else {
    console.warn('Environment variables missing - app may not function correctly');
  }
} catch (error) {
  console.error('Error loading environment variables:', error);
  // Provide empty values - app will show errors at runtime
  envVars = {
    supabaseUrl: '',
    supabaseAnonKey: '',
  };
}

export const env = envVars;

// Helper to check if we're in production
export const isProduction = process.env.NODE_ENV === 'production';

// Helper to check if we're in development
export const isDevelopment = process.env.NODE_ENV === 'development';

// Security checks
export function performSecurityChecks(): void {
  const checks = [];

  // Check 1: Ensure HTTPS in production
  if (isProduction && !env.supabaseUrl.startsWith('https://')) {
    checks.push('⚠️  Supabase URL should use HTTPS in production');
  }

  // Check 2: Warn about missing Stripe key if needed
  if (!env.stripePublishableKey) {
    checks.push('ℹ️  Stripe publishable key not configured (payments disabled)');
  }

  // Check 3: Warn if using example/default values
  if (env.supabaseUrl.includes('example')) {
    checks.push('⚠️  Using example Supabase URL - app will not function');
  }

  // Check 4: Validate key doesn't look like a service role key (security issue)
  if (env.supabaseAnonKey.length > 200) {
    checks.push('⚠️  Supabase anon key looks suspicious - ensure you\'re not using service_role key!');
  }

  if (checks.length > 0) {
    console.log('\n📋 Security Checks:');
    checks.forEach(check => console.log(check));
    console.log('');
  }
}

// Run security checks on import
if (isDevelopment) {
  performSecurityChecks();
}

// Type-safe environment variable access
export default env;
