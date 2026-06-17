/**
 * API Configuration for the Synergy Dashboard API.
 *
 * All API constants are centralized here for easy environment switching.
 */

/** Base URL of the backend API. */
export const API_BASE_URL = 'http://172.16.2.55:81/synergydashboardapi_uat/api/Synergy';

/** Full URL for the generic PostData endpoint. */
export const API_POST_DATA_URL = `${API_BASE_URL}/PostData`;

/** Device identifier used for API requests. */
export const DEVICE_ID = 'g2-mobile-001';

/**
 * API Endpoints.
 */
export const ENDPOINTS = {
  /** Login validation method passed in POST body. */
  validateLogin: '',
} as const;

/** Default request timeout in milliseconds. */
export const DEFAULT_TIMEOUT = 15000;

/** Token refresh interval: 5 minutes before expiry. */
export const TOKEN_REFRESH_BUFFER_MS = 5 * 60 * 1000;
