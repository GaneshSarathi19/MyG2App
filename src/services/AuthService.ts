import { API_BASE_URL, ENDPOINTS, DEVICE_ID } from '../api/config';
import { LoginRequest, LoginResponse } from '../api/interfaces/AuthTypes';
import { encryptPassword } from '../utils/encryptPassword';

/** =========================================================================== *
 * AuthService
 *
 * Dedicated service for authentication-related API calls.
 *
 * TODO: Replace the JSON body structure below if the backend team confirms
 *       a different request / response contract.
 * =========================================================================== */

/**
 * Validates user credentials against the backend API.
 *
 * @param username - The username / email entered by the user.
 * @param password - The password entered by the user.
 * @returns A promise resolving to the backend login response.
 *
 * @throws Error on network failure or non-OK HTTP status.
 */
export const validateLogin = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  // ----------------------------------------------------------------------- *
  // Build the full endpoint URL from the configurable base + path.
  // Change `ENDPOINTS.validateLogin` in `src/api/config.ts` when the
  // final endpoint path is confirmed by the backend team.
  // ----------------------------------------------------------------------- *
  const url = `${API_BASE_URL}/${ENDPOINTS.validateLogin}`;

  // ----------------------------------------------------------------------- *
  // Construct the request payload per the agreed contract.
  // ----------------------------------------------------------------------- *
  const payload: LoginRequest = {
    Method: 'ValidateLogin',
    Data: {
      User: username.trim(),
      Secret: encryptPassword(password),
      DeviceId: DEVICE_ID,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: LoginResponse = await response.json();
    return data;
  } catch (error) {
    // ------------------------------------------------------------------- *
    // Re-throw so the caller (e.g., AuthContext or LoginScreen) can
    // decide how to display the error to the user.
    // ------------------------------------------------------------------- *
    if (error instanceof Error) {
      throw new Error(`Login request failed — ${error.message}`);
    }
    throw new Error('Login request failed — an unexpected error occurred');
  }
};

/**
 * Fallback / mock implementation used when the backend is not yet available.
 *
 * TODO: Remove this function once the real API is configured.
 *
 * Simulates a backend call so the UI can be tested end-to-end.
 *
 * @param username - The username entered.
 * @param password - The password entered.
 * @returns A hardcoded success or failure response.
 */
export const validateLoginMock = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  // Simulate network latency
  await new Promise<void>(resolve => setTimeout(resolve, 300));

  if (username.trim() === 'admin' && password === '1234') {
    return {
      IsSuccess: true,
      Message: 'Login successful',
      Data: [
        {
          EmployeeID: 'EMP001',
          Designation: 'Software Developer',
          Token: 'mock-jwt-token-for-g2-mobile',
          FirstName: 'Admin',
          LandingNumber: null,
          LandingStage: null,
          Issynergyswipeallowed: true,
          IsBackEndInfoVisible: true,
        },
      ],
    };
  }

  return {
    IsSuccess: false,
    Message: 'Invalid Username or Password',
    Data: [],
  };
};
