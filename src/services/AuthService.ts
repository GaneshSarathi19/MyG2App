import axiosClient from '../api/axiosClient';
import {LoginRequest, LoginResponse} from '../api/interfaces/AuthTypes';
import {API_POST_DATA_URL, DEVICE_ID} from '../api/config';
import {encryptPassword} from '../utils/encryptPassword';

/**
 * Service for all authentication-related API operations.
 * Uses axiosClient for all HTTP requests with automatic
 * auth header injection, logging, and 401 handling.
 */
export const AuthService = {
  /**
   * Validates user credentials against the backend API.
   *
   * @param username - The username or email.
   * @param password - The plain-text password (will be encrypted before sending).
   * @returns Promise resolving to the backend login response.
   */
  validateLogin: async (username: string, password: string): Promise<LoginResponse> => {
    const payload: LoginRequest = {
      Method: 'ValidateLogin',
      Data: {
        User: username.trim(),
        Secret: encryptPassword(password),
        DeviceId: DEVICE_ID,
      },
    };

    // Use the full PostData URL for the generic backend endpoint
    const {data} = await axiosClient.post<LoginResponse>(API_POST_DATA_URL, payload);
    return data;
  },

  /**
   * Mock implementation for offline testing.
   *
   * @param username - The username or email.
   * @param password - The password.
   * @returns Promise resolving to a mock login response.
   */
  validateLoginMock: async (username: string, password: string): Promise<LoginResponse> => {
    await new Promise<void>(resolve => setTimeout(resolve, 300));

    if (username.trim() === 'admin' && password === '1234') {
      return {
        IsSuccess: true,
        Message: 'Login successful',
        Data: [
          {
            EmployeeCode: '0001',
            EmployeeID: 'EMP001',
            FirstName: 'Admin',
            LastName: 'User',
            CorporateEmailID: 'admin@g2techsoft.com',
            DepartmentID: 'DEPT-001',
            Department: 'IT',
            DepartmentICode: 1,
            DesignationID: 'DESIG-001',
            Designation: 'Software Developer',
            DesignationICode: 10144,
            TechStreamId: null,
            TechStream: null,
            MentorId: 'M002',
            mentorFirstName: 'Syed Ibrahim',
            mentorLastName: 'N',
            mentorCorporateEmailID: 'solomon@g2tsolutions.com',
            MentorProfilePicture: '',
            FatherName: 'Father',
            DateOfJoining: '2020-01-01',
            DateOfBirth: '1990-01-01',
            MaritalStatusId: 'MS001',
            MaritalStatus: 'Single',
            PANNo: '',
            PFNo: '',
            PassPortNo: '',
            BloodGroupID: 'BG001',
            BloodGroup: 'B+',
            ESINo: '',
            ProfilePicture: '',
            IsInternalResource: 1,
            ResourceName: 'Admin User',
            ResourceNo: '0001',
            LandingStage: 'Marketing Dashboard',
            LandingNumber: null,
            Token: 'mock-jwt-token-for-g2-mobile',
            Issynergyswipeallowed: 0,
          },
        ],
      };
    }

    return {
      IsSuccess: false,
      Message: 'Invalid Username or Password',
      Data: [],
    };
  },
};
