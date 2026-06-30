import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {API_BASE_URL, DEVICE_ID} from './config';
import {store} from '../redux/store';
import {logout} from '../redux/slices/authSlice';
import {logger} from '../utils/logger';

/* ── Axios Instance ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Centralised Axios instance for all API calls.
   Handles request/response interceptors for auth token management,
   automatic token refresh on 401, and request/response logging.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request Interceptor ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Automatically injects the auth token into every request's headers.
   Reads the latest token from the Redux store so there is no stale
   state risk.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth?.authToken;

    if (token && config.headers) {
      config.headers.SecurityToken = token;
      config.headers['X-Device-Id'] = DEVICE_ID;
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

/* ── Response Interceptor (401 Refresh) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Automatically refreshes the access token when a 401 is received,
   then retries the original request with the new token.
   Unsuccessful refresh logs the user out.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

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

    // Handle 401 - Unauthorized (token expired or invalid)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for the refresh to complete, then retry
        return new Promise(resolve => {
          addRefreshSubscriber(token => {
            if (originalRequest.headers) {
              originalRequest.headers.SecurityToken = token;
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
            originalRequest.headers.SecurityToken = newToken;
          }
          return axiosClient(originalRequest);
        }

        // Refresh failed - force logout
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

/* ── Token Refresh ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Placeholder for the actual token refresh call.
   Reads the Redux store to see if a new token was already set
   (e.g. by background refresh), giving a last chance before logout.

   TODO: Replace with real backend refresh endpoint when ready.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

async function attemptTokenRefresh(): Promise<string | null> {
  // 1st chance: token may have been refreshed by background service
  const current = store.getState().auth?.authToken;
  if (current) {
    return current;
  }

  // 2nd chance: call backend refresh endpoint
  // Example (replace with actual endpoint):
  // const {data} = await axios.post('/auth/refresh', {
  //   refreshToken: store.getState().auth.refreshToken,
  // });
  // store.dispatch(refreshTokenSuccess({
  //   authToken: data.token,
  //   tokenExpiry: Date.now() + data.expiresIn,
  // }));
  // return data.token;

  logger.log('[AxiosClient] Token refresh attempted - backend endpoint not yet implemented');
  return null;
}

/* ── Typed Request Helpers ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Convenience wrappers for typed requests (optional usage).
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const post = async <T,>(url: string, data?: unknown, config?: object): Promise<T> => {
  const response = await axiosClient.post<T>(url, data, config);
  return response.data;
};

export const get = async <T,>(url: string, config?: object): Promise<T> => {
  const response = await axiosClient.get<T>(url, config);
  return response.data;
};

/* ── callGetList ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Mobile equivalent of the web API's `callGetList` method.
   Matches the Synergy Dashboard `GetData` endpoint contract:

     GET /GetData?query=<selectedData>&filters=<filterData>

   - `SecurityToken` header is automatically injected by the request
     interceptor above (reads from Redux store).
   - `Token` is merged into the `filters` payload for backward
     compatibility with the original web API.
   - The backend may read the token from either the header OR the
     filters object during the transition period.

   @param selectedData - The query method (e.g. "GetEmployeeLeaveSummary").
   @param filterData   - Optional additional filters (merged into the
                        final filters payload, which always contains
                        the auth Token).
   @returns Promise resolving to the full API response object.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const callGetList = async <TResponseData = unknown,>(
  selectedData: string,
  filterData: Record<string, unknown> = {},
): Promise<{
  IsSuccess: boolean;
  Message: string;
  Data: TResponseData;
}> => {
  const token = store.getState().auth?.authToken;
  const filters = {
    Token: token || '',
    ...filterData,
  };
  const filtersParam = encodeURIComponent(JSON.stringify(filters));
  const url = `/GetData?query=${encodeURIComponent(selectedData)}&filters=${filtersParam}`;

  const response = await axiosClient.get<any>(url);

  return response.data;
};

export default axiosClient;
