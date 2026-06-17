import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {API_BASE_URL} from './config';
import {store} from '../redux/store';
import {logout, refreshTokenSuccess} from '../redux/slices/authSlice';
import {logger} from '../utils/logger';

/* ── Axios Instance ─────────────────────────────────────────────────────── */

/**
 * Centralized Axios instance for all API calls.
 * Handles request/response interceptors for auth token management,
 * automatic token refresh on 401, and request/response logging.
 */
const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request Interceptor ──────────────────────────────────────────────── */

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = store.getState().auth.authToken;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    logger.log(
      `[Axios Request] ${config.method?.toUpperCase()} ${config.url}`,
      config.data ? JSON.stringify(config.data, null, 2) : '',
    );

    return config;
  },
  error => {
    logger.error('[Axios Request Error]', error);
    return Promise.reject(error);
  },
);

/* ── Response Interceptor ─────────────────────────────────────────────── */

/** Queue of pending requests waiting for token refresh. */
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

axiosClient.interceptors.response.use(
  response => {
    logger.log(
      `[Axios Response] ${response.status} ${response.config.url}`,
      JSON.stringify(response.data, null, 2),
    );
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Handle 401 - Unauthorized (token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete, then retry
        return new Promise(resolve => {
          addRefreshSubscriber(token => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        // TODO: Replace with actual backend refresh endpoint when available
        const newToken = await attemptTokenRefresh();

        if (newToken) {
          onTokenRefreshed(newToken);
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosClient(originalRequest);
        }

        // Refresh failed - log out the user
        store.dispatch(logout());
        return Promise.reject(error);
      } catch (refreshError) {
        store.dispatch(logout());
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Log non-401 errors
    logger.error(
      `[Axios Response Error] ${error.response?.status} ${originalRequest.url}:`,
      error.message,
    );

    return Promise.reject(error);
  },
);

/* ── Token Refresh ─────────────────────────────────────────────────────── */

/**
 * Attempts to refresh the auth token.
 * Placeholder - replace with actual backend refresh call when available.
 */
async function attemptTokenRefresh(): Promise<string | null> {
  // TODO: Implement actual token refresh when backend endpoint is available.
  // Example:
  // const state = store.getState();
  // const response = await axios.post('/refresh', {
  //   refreshToken: state.auth.refreshToken,
  // });
  // store.dispatch(refreshTokenSuccess({
  //   authToken: response.data.token,
  //   tokenExpiry: Date.now() + response.data.expiresIn,
  // }));
  // return response.data.token;

  logger.log('[AxiosClient] Token refresh attempted - backend endpoint not yet implemented');
  return null;
}

/* ── Typed Request Helpers ────────────────────────────────────────────── */

/**
 * Performs a typed POST request.
 */
export const post = async <T,>(url: string, data?: unknown, config?: object): Promise<T> => {
  const response = await axiosClient.post<T>(url, data, config);
  return response.data;
};

/**
 * Performs a typed GET request.
 */
export const get = async <T,>(url: string, config?: object): Promise<T> => {
  const response = await axiosClient.get<T>(url, config);
  return response.data;
};

export default axiosClient;
