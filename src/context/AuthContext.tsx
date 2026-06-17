import React, {createContext, useContext, ReactNode, useCallback} from 'react';
import {LoginUserData} from '../api/interfaces/AuthTypes';
import {
  useAppSelector,
  useAppDispatch,
} from '../redux/hooks';
import {
  logout as logoutAction,
  loginUser,
  clearError,
  LoginResult,
} from '../redux/slices/authSlice';
import {tokenRefreshService} from '../services/TokenRefreshService';
import {logger} from '../utils/logger';

/* ── Types ────────────────────────────────────────────────────────────── */

interface AuthContextType {
  /** Whether the user is currently authenticated. */
  isLoggedIn: boolean;
  /** Initiates the login flow. Returns a result object for UI display. */
  login: (username: string, password: string, rememberMe: boolean) => Promise<LoginResult>;
  /** Logs the user out and clears auth state. */
  logout: () => void;
  /** The current JWT auth token, or null if not logged in. */
  authToken: string | null;
  /** The currently authenticated user's profile data. */
  user: LoginUserData | null;
  /** Whether an async auth operation is in progress. */
  isLoading: boolean;
  /** The most recent auth error message, or null. */
  error: string | null;
  /** Clears the current auth error. */
  clearAuthError: () => void;
}

/* ── Context ──────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

/* ── Provider ──────────────────────────────────────────────────────────── */

export const AuthProvider = ({children}: {children: ReactNode}) => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector(state => state.auth);
  const isLoggedIn = auth?.isLoggedIn ?? false;
  const authToken = auth?.authToken ?? null;
  const user = auth?.user ?? null;
  const isLoading = auth?.isLoading ?? false;
  const error = auth?.error ?? null;

  /**
   * Validates credentials and logs the user in via Redux.
   */
  const login = useCallback(
    async (username: string, password: string, rememberMe: boolean): Promise<LoginResult> => {
      const result = await dispatch(loginUser({username, password, rememberMe})).unwrap();

      // Start automatic token refresh after successful login
      if (result.success) {
        tokenRefreshService.start();
        logger.log('[AuthContext] Token refresh service started after login');
      }

      return result;
    },
    [dispatch],
  );

  /**
   * Logs the user out, clears state, and stops token refresh.
   */
  const logout = useCallback(() => {
    tokenRefreshService.stop();
    dispatch(logoutAction());
    logger.log('[AuthContext] Logged out, token refresh service stopped');
  }, [dispatch]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        authToken,
        user,
        isLoading,
        error,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/* ── Hook ───────────────────────────────────────────────────────────────── */

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
