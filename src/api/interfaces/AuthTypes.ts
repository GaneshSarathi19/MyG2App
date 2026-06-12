/** ========================================================================== *
 * Login Request / Response TypeScript Interfaces
 *
 * Based on the agreed backend contract:
 *   Request  → POST {API_BASE_URL}/ValidateLogin
 *   Response → { IsSuccess, Message, Data: [...] }
 *
 * TODO: If the backend changes the contract, update these interfaces and
 *       the mapping logic inside `AuthService.ts` accordingly.
 * =========================================================================== */

/**
 * Payload sent to the login validation endpoint.
 *
 * @property Method - The backend method identifier, always "ValidateLogin".
 * @property Data   - Object containing user credentials and device info.
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
  EmployeeID: string;
  Designation: string;
  /** JWT or session token issued by the backend. */
  Token: string;
  FirstName: string;
  /** Stage information — nullable per backend contract. */
  LandingNumber: string | null;
  LandingStage: string | null;
  Issynergyswipeallowed: boolean;
  IsBackEndInfoVisible: boolean;
}

/**
 * Response returned by the login validation endpoint.
 *
 * @property IsSuccess - Whether the authentication succeeded.
 * @property Message   - Human-readable status from the backend.
 * @property Data      - Array of user data entries (typically 1 item on success).
 */
export interface LoginResponse {
  IsSuccess: boolean;
  Message: string;
  Data: LoginUserData[];
}
