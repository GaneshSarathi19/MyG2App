/**
 * API Configuration
 *
 * TODO: Update API_BASE_URL when the backend environment is provisioned.
 *
 * Replace the placeholder with the actual base URL, for example:
 *   - Local dev : 'http://10.0.2.2:5000'  (Android emulator)
 *   - Local dev : 'http://localhost:5000'  (iOS simulator)
 *   - Staging   : 'https://staging-api.example.com'
 *   - Production: 'https://api.example.com'
 */
export const API_BASE_URL = 'https://api-placeholder.example.com';

/**
 * API Endpoints configuration.
 *
 * TODO: Update the endpoint path when the backend contract is confirmed.
 *
 * Current convention used by the app:
 *   POST {API_BASE_URL}/ValidateLogin
 *   -- or --
 *   POST {API_BASE_URL}/auth/login
 */
export const ENDPOINTS = {
  /**
   * Login validation endpoint.
   * Set this to just the path segment (e.g., 'ValidateLogin' or 'auth/login').
   * The full URL is built inside the auth service.
   */
  validateLogin: 'ValidateLogin',
} as const;

/**
 * Device identifier used for API requests.
 * In a real app, generate a unique device ID during app initialization
 * and store it in AsyncStorage or react-native-device-info.
 */
export const DEVICE_ID = 'g2-mobile-001';
