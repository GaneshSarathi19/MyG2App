/** ==========================================================================
 * Employee Master List Types
 *
 * Response from: GET /GetData?query=GetEmployeeMasterList
 * ========================================================================== */

export interface EmployeeRecord {
  EmployeeId: string;
  Name: string;
  Designation: string;
  Department: string;
  EmailID: string;
  MentorID: string;
  Mentor: string;
  EmployeeContact: string | null;
  MentorContact: string | null;
  EmployeeStatus: boolean;
}

export interface EmployeeMasterListResponse {
  IsSuccess: boolean;
  Message: string;
  Data: EmployeeRecord[];
}


