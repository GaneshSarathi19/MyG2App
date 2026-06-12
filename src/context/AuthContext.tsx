import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import {
  validateLoginMock,
} from '../services/AuthService';
import { LoginUserData } from '../api/interfaces/AuthTypes';

// --------------------------------------------------------------------------- *
// TODO: When the real backend is ready, replace `validateLoginMock`
//       with `validateLogin` from '../services/AuthService'.
// --------------------------------------------------------------------------- *

/* ── Types ──────────────────────────────────────────────────────────────── */

/**
 * Extended authentication state including the JWT token and user profile
 * returned by the backend.
 */
interface AuthContextType {
  /** Whether the user is currently authenticated. */
  isLoggedIn: boolean;

  /** Authenticates with the backend API using username + password. */
  login: (username: string, password: string) => Promise<LoginResult>;

  /** Clears all auth state (token + user profile). */
  logout: () => void;

  /** The JWT / session token returned by the backend. */
  authToken: string | null;

  /** User profile data returned on a successful login. */
  user: LoginUserData | null;
}

/** Result shape of the `login` call. */
export interface LoginResult {
  /** Whether the login was successful. */
  success: boolean;
  /** Human-readable message from the backend or a fallback. */
  message: string;
}

/* ── Context ────────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType,
);

export const AuthProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginUserData | null>(null);

  /**
   * Calls the backend (or mock) to validate credentials.
   *
   * @param username - The username / email.
   * @param password - The user's password.
   * @returns A `LoginResult` describing the outcome.
   */
  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResult> => {
    /*
     * TODO: Replace `validateLoginMock` with `validateLogin` once
     * the real backend is configured. See `src/services/AuthService.ts`.
     */
    const response = await validateLoginMock(username, password);

    if (response.IsSuccess && response.Data.length > 0) {
      const userData = response.Data[0];
      setAuthToken(userData.Token);
      setUser(userData);
      setIsLoggedIn(true);

      return {
        success: true,
        message: response.Message,
      };
    }

    return {
      success: false,
      message: response.Message,
    };
  };

  const logout = () => {
    setAuthToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
        authToken,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
