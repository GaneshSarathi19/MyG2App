import {createSlice, createAsyncThunk, PayloadAction} from '@reduxjs/toolkit';
import {LoginUserData} from '../../api/interfaces/AuthTypes';
import {AuthService} from '../../services/AuthService';
import {logger} from '../../utils/logger';

/* ── Types ────────────────────────────────────────────────────────────── */

export interface AuthState {
  isLoggedIn: boolean;
  authToken: string | null;
  refreshToken: string | null;
  user: LoginUserData | null;
  rememberMe: boolean;
  isLoading: boolean;
  error: string | null;
  tokenExpiry: number | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResult {
  success: boolean;
  message: string;
}

/* ── Initial State ────────────────────────────────────────────────────── */

const initialState: AuthState = {
  isLoggedIn: false,
  authToken: null,
  refreshToken: null,
  user: null,
  rememberMe: false,
  isLoading: false,
  error: null,
  tokenExpiry: null,
};

/* ── Async Thunks ──────────────────────────────────────────────────────── */

/**
 * Async thunk that validates credentials via the backend API.
 */
export const loginUser = createAsyncThunk<
  LoginResult,
  LoginCredentials,
  {rejectValue: string}
>('auth/loginUser', async ({username, password, rememberMe}, {rejectWithValue}) => {
  try {
    const response = await AuthService.validateLogin(username, password);

    if (response.IsSuccess && response.Data.length > 0) {
      const userData = response.Data[0];
      return {
        success: true,
        message: response.Message,
        user: userData,
        authToken: userData.Token,
        rememberMe,
      } as LoginResult & {
        user: LoginUserData;
        authToken: string;
        rememberMe: boolean;
      };
    }

    return {success: false, message: response.Message} as LoginResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed - please try again.';
    logger.error('[AuthSlice] Login error:', message);
    return rejectWithValue(message);
  }
});

/**
 * Async thunk that refreshes the auth token.
 * Placeholder for backend refresh endpoint integration.
 */
export const refreshAuthToken = createAsyncThunk<
  {authToken: string; tokenExpiry: number},
  void,
  {rejectValue: string}
>('auth/refreshToken', async (_, {getState, rejectWithValue}) => {
  try {
    // TODO: Replace with actual backend refresh endpoint when available.
    // const state = getState() as RootState;
    // const response = await AuthService.refreshToken(state.auth.refreshToken);

    logger.log('[AuthSlice] Token refresh requested - backend endpoint not yet implemented');

    // For now, reject to trigger logout flow
    return rejectWithValue('Token refresh not implemented by backend');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    logger.error('[AuthSlice] Refresh error:', message);
    return rejectWithValue(message);
  }
});

/* ── Slice ────────────────────────────────────────────────────────────── */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: state => {
      state.isLoggedIn = false;
      state.authToken = null;
      state.refreshToken = null;
      state.user = null;
      state.tokenExpiry = null;
      state.error = null;
      state.isLoading = false;
    },
    setRememberMe: (state, action: PayloadAction<boolean>) => {
      state.rememberMe = action.payload;
    },
    clearError: state => {
      state.error = null;
    },
    refreshTokenSuccess: (
      state,
      action: PayloadAction<{authToken: string; tokenExpiry: number}>,
    ) => {
      state.authToken = action.payload.authToken;
      state.tokenExpiry = action.payload.tokenExpiry;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: builder => {
    builder
      // loginUser
      .addCase(loginUser.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        const payload = action.payload as LoginResult & {
          user?: LoginUserData;
          authToken?: string;
          rememberMe?: boolean;
        };

        if (payload.success && payload.user && payload.authToken) {
          state.isLoggedIn = true;
          state.authToken = payload.authToken;
          state.user = payload.user;
          state.rememberMe = payload.rememberMe ?? false;
          // Default token expiry: 24 hours from now
          // Backend should provide actual expiry; adjust when available
          state.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;
          state.error = null;
        } else {
          state.error = payload.message || 'Login failed';
        }
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed - please try again.';
      })
      // refreshAuthToken
      .addCase(refreshAuthToken.pending, state => {
        state.isLoading = true;
      })
      .addCase(refreshAuthToken.fulfilled, (state, action) => {
        state.authToken = action.payload.authToken;
        state.tokenExpiry = action.payload.tokenExpiry;
        state.isLoading = false;
      })
      .addCase(refreshAuthToken.rejected, state => {
        // Token refresh failed - clear auth state
        state.isLoggedIn = false;
        state.authToken = null;
        state.refreshToken = null;
        state.user = null;
        state.tokenExpiry = null;
        state.isLoading = false;
      });
  },
});

export const {logout, setRememberMe, clearError, refreshTokenSuccess, setAuthLoading} =
  authSlice.actions;

export default authSlice.reducer;
