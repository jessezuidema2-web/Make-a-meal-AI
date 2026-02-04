// Expo app configuration
// Expo SDK 50+ automatically loads EXPO_PUBLIC_ variables from .env
// This file just extends the base app.json configuration

module.exports = ({ config }) => {
  // Verify environment variables are loaded
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  console.log('📋 App Config Loading...');
  console.log('   Supabase URL:', supabaseUrl ? '✅ Found' : '❌ Missing');
  console.log('   Supabase Key:', supabaseKey ? '✅ Found' : '❌ Missing');

  if (!supabaseUrl || !supabaseKey) {
    console.error('\n❌ ERROR: Missing required environment variables!');
    console.error('   Make sure .env file exists with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY\n');
  }

  return {
    ...config,
    extra: {
      ...config.extra,
      // Explicitly pass env vars to expo-constants
      supabaseUrl,
      supabaseAnonKey: supabaseKey,
    },
  };
};
