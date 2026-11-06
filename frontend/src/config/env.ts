const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  WS_URL: import.meta.env.VITE_WS_URL || 'http://localhost:5000',
  // Signup emails can be served by a separate backend. Defaults to the main API.
  OTP_API_BASE_URL: import.meta.env.VITE_OTP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  YOUTUBE_API_KEY: import.meta.env.VITE_YOUTUBE_API_KEY || '',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
} as const;

export default env;
