/* ────────────────────────────────────────────────────────────────────
   Leave Types — Request / Response contracts for the Synergy API
   ──────────────────────────────────────────────────────────────────── */

/**
 * Represents a single leave entry to be submitted to the backend.
 */
export interface LeaveDetail {
  /** Leave date in M/D/YYYY format (e.g. "6/1/2026") */
  LeaveDate: string;
  /** Number of leave hours (e.g. "8") */
  LeaveHours: string;
  /** Date the leave was applied, in YYYY-MM-DD format */
  AppliedDate: string;
  /** Reason / description for the leave */
  Reason: string;
  /** File attachment (currently not supported, empty string) */
  LeaveFile: string;
  /** GUID of the leave type */
  LeaveTypeID: string;
}

/**
 * Represents a single leave type as returned by the backend master list.
 * Supports multiple alias field names for backward compatibility.
 */
export interface LeaveType {
  LeaveTypeID: string;
  LeaveTypeDescription: string;
}

/**
 * Raw leave type shape from the API before normalisation.
 * The backend may use either PascalCase or camelCase key names.
 */
export interface RawLeaveType {
  Id?: string;
  id?: string;
  LeaveTypeID?: string;
  leaveTypeID?: string;
  LeaveTypeDescription?: string;
  leaveTypeDescription?: string;
  LeaveTypeName?: string;
  leaveTypeName?: string;
  [key: string]: any;
}

/**
 * Represents a single leave record as returned by the
 * GetEmployeeLeaveSummary API method.
 *
 * Actual API shape:
 * {
 *   "LeaveId": "uuid",
 *   "From": "2024-05-20T00:00:00",
 *   "To": "2024-05-20T00:00:00",
 *   "TotalDays": 1.0,
 *   "ApprovedBy": "Name",
 *   "Status": "Approved"
 * }
 */
export interface LeaveSummaryRecord {
  LeaveId: string;
  From: string;
  To: string;
  TotalDays: number;
  ApprovedBy: string;
  Status: string;
  /** Legacy / optional fields that may still appear */
  LeaveDetailsID?: string;
  LeaveTypeID?: string;
  LeaveDate?: string;
  AppliedDate?: string;
  LeaveHours?: string;
  Reason?: string;
  LeaveFile?: string;
  LeaveTypeName?: string;
  CompensationRequired?: number;
  CompensationDate?: string;
}

/* ── Request / Response Envelopes ────────────────────────────────── */

/**
 * Request payload for the PostEmployeeLeave API method.
 * The LeaveDetails field is a JSON-stringified array of LeaveDetail.
 */
export interface PostEmployeeLeaveRequest {
  Method: 'PostEmployeeLeave';
  Data: { LeaveDetails: string };
  Status: string;
  Message: string;
}

/**
 * Response from any Post Employee Leave API method.
 */
export interface PostEmployeeLeaveResponse {
  IsSuccess: boolean;
  Message: string;
  Data: unknown;
}

/**
 * Response from the GetEmployeeLeaveSummary API method.
 */
export interface EmployeeLeaveSummaryResponse {
  IsSuccess: boolean;
  Message: string;
  Data: LeaveSummaryRecord[];
}

/* ── Update / Delete ────────────────────────────────────────────────── */

/**
 * Fields required to update an existing leave record.
 */
export interface UpdateLeaveDetail {
  LeaveId: string;
  LeaveHours: string;
  CompensationRequired: number;
  CompensationDate: string;
  LeaveDetailsID: string;
}

/**
 * Minimal fields required to delete a leave record.
 */
export interface DeleteLeaveDetail {
  LeaveId: string;
}

/**
 * Request payload for the PostEmployeeLeaveUpdate API method.
 */
export interface PostEmployeeLeaveUpdateRequest {
  Method: 'PostEmployeeLeaveUpdate';
  Data: { LeaveDetails: string };
  Status: string;
  Message: string;
}

/**
 * Request payload for the PostEmployeeLeaveDelete API method.
 */
export interface PostEmployeeLeaveDeleteRequest {
  Method: 'PostEmployeeLeaveDelete';
  Data: { LeaveDetails: string };
  Status: string;
  Message: string;
}
