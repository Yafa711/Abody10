// Constants for the application
export const EnvConstants = {
  // Safe area insets (will be updated dynamically in real implementation)
  safeAreaInsets: {
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },

  // API configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.example.com',

  // Supabase configuration (from CLAUDE.md)
  SUPABASE_URL: 'https://rjcqkwgjqeqwzfbedwav.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_1Uz2U4l6oUH67i7sjTyr0g_rwqRFPIO',

  // App configuration
  APP_NAME: 'NewElectroStore',
  VERSION: '1.0.0',
};

export default EnvConstants;