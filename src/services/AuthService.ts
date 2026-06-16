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
          EmployeeCode: '0001',
          EmployeeID: 'EMP001',
          FirstName: 'Admin',
          LastName: 'User',
          CorporateEmailID: 'admin@g2techsoft.com',
          DepartmentID: 'DEPT-001',
          Department: 'Marketing',
          DepartmentICode: 4,
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
};
