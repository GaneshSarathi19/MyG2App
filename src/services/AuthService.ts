import { API_BASE_URL, DEVICE_ID } from '../api/config';
import { post } from '../api/client';
import { LoginRequest, LoginResponse } from '../api/interfaces/AuthTypes';
import { encryptPassword } from '../utils/encryptPassword';

/**
 * Validates user credentials against the backend API.
 *
 * @param username - The username or email.
 * @param password - The password.
 * @returns Promise resolving to the backend login response.
 * @throws ApiError on network failure or non-2xx status.
 */
export const validateLogin = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  const payload: LoginRequest = {
    Method: 'ValidateLogin',
    Data: {
      User: username.trim(),
      Secret: encryptPassword(password),
      DeviceId: DEVICE_ID,
    },
  };

  const { data } = await post<LoginResponse>(API_BASE_URL, payload);

  return data;
};

/**
 * Mock implementation for offline testing.
 */
export const validateLoginMock = async (
  username: string,
  password: string,
): Promise<LoginResponse> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 300));

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
