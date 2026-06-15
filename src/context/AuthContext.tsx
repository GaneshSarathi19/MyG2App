import React, { createContext, useContext, useState, ReactNode } from 'react';
import { validateLogin } from '../services/AuthService';
import { LoginUserData } from '../api/interfaces/AuthTypes';

/* ── Types ────────────────────────────────────────────────────────────── */

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  authToken: string | null;
  user: LoginUserData | null;
}

export interface LoginResult {
  success: boolean;
  message: string;
}

/* ── Context ──────────────────────────────────────────────────────────── */

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [user, setUser] = useState<LoginUserData | null>(null);

  /**
   * Calls the backend to validate credentials.
   */
  const login = async (
    username: string,
    password: string,
  ): Promise<LoginResult> => {
    const response = await validateLogin(username, password);

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
