/** ========================================================================== *
 * Login Request / Response TypeScript Interfaces
 *
 * Based on the agreed backend contract:
 *   Request  → POST {API_BASE_URL}/ValidateLogin
 *   Response → { IsSuccess, Message, Data: [...] }
 * =========================================================================== */

/**
 * Payload sent to the login validation endpoint.
 */
export interface LoginRequest {
  Method: 'ValidateLogin';
  Data: {
    User: string;
    Secret: string;
    DeviceId: string;
  };
}

/**
 * A single user entry returned in the `Data` array on a successful login.
 */
export interface LoginUserData {
  EmployeeCode: string;
  EmployeeID: string;
  FirstName: string;
  LastName: string;
  CorporateEmailID: string;
  DepartmentID: string;
  Department: string;
  DepartmentICode: number;
  DesignationID: string;
  Designation: string;
  DesignationICode: number;
  TechStreamId: string | null;
  TechStream: string | null;
  MentorId: string;
  mentorFirstName: string;
  mentorLastName: string;
  mentorCorporateEmailID: string;
  MentorProfilePicture: string;
  FatherName: string;
  DateOfJoining: string;
  DateOfBirth: string;
  MaritalStatusId: string;
  MaritalStatus: string;
  PANNo: string;
  PFNo: string;
  PassPortNo: string;
  BloodGroupID: string;
  BloodGroup: string;
  ESINo: string;
  ProfilePicture: string;
  IsInternalResource: number;
  ResourceName: string;
  ResourceNo: string;
  LandingStage: string | null;
  LandingNumber: string | null;
  Token: string;
  Issynergyswipeallowed: number;
}

/**
 * Response returned by the login validation endpoint.
 */
export interface LoginResponse {
  IsSuccess: boolean;
  Message: string;
  Data: LoginUserData[];
}
