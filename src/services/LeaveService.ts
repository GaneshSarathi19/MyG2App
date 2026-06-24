import axiosClient, {callGetList} from '../api/axiosClient';
import {API_POST_DATA_URL} from '../api/config';
import {logger} from '../utils/logger';
import {
  LeaveDetail,
  LeaveType,
  PostEmployeeLeaveRequest,
  PostEmployeeLeaveResponse,
  EmployeeLeaveSummaryResponse,
  UpdateLeaveDetail,
  PostEmployeeLeaveUpdateRequest,
  PostEmployeeLeaveDeleteRequest,
} from '../api/interfaces/LeaveTypes';

/**
 * Service for all leave-related API operations.
 *
 * Authentication: the `axiosClient` interceptor automatically attaches
 * `Authorization: Bearer <token>` to every outgoing request. The legacy
 * `GetData` endpoints also include the token in the `filters` query
 * param for backward compatibility until the backend fully migrates to
 * the `Authorization` header.
 */
export const LeaveService = {
  /**
   * Submits a new leave request to the backend.
   */
  postEmployeeLeave: async (
    details: LeaveDetail[],
  ): Promise<PostEmployeeLeaveResponse> => {
    const payload: PostEmployeeLeaveRequest = {
      Method: 'PostEmployeeLeave',
      Data: {
        LeaveDetails: JSON.stringify(details),
      },
      Status: '',
      Message: '',
    };

    const {data} =
      await axiosClient.post<PostEmployeeLeaveResponse>(
        API_POST_DATA_URL,
        payload,
      );

    logger.log(
      '[LeaveService] PostEmployeeLeave response:',
      JSON.stringify(data, null, 2),
    );

    return data;
  },

  /**
   * Fetches the employee leave summary from the backend.
   */
  getEmployeeLeaveSummary: async (): Promise<EmployeeLeaveSummaryResponse> => {
    const response = await callGetList<EmployeeLeaveSummaryResponse['Data']>(
      'GetEmployeeLeaveSummary',
    );

    logger.log(
      '[LeaveService] GetEmployeeLeaveSummary response:',
      JSON.stringify(response, null, 2),
    );

    return response as EmployeeLeaveSummaryResponse;
  },

  /**
   * Updates an existing leave request.
   */
  updateEmployeeLeave: async (
    detail: UpdateLeaveDetail,
  ): Promise<PostEmployeeLeaveResponse> => {
    const payload: PostEmployeeLeaveUpdateRequest = {
      Method: 'PostEmployeeLeaveUpdate',
      Data: {
        LeaveDetails: JSON.stringify([detail]),
      },
      Status: '',
      Message: '',
    };

    const {data} =
      await axiosClient.post<PostEmployeeLeaveResponse>(
        API_POST_DATA_URL,
        payload,
      );

    logger.log(
      '[LeaveService] PostEmployeeLeaveUpdate response:',
      JSON.stringify(data, null, 2),
    );

    return data;
  },

  /**
   * Deletes a leave request by its ID.
   */
  deleteEmployeeLeave: async (
    leaveId: string,
  ): Promise<PostEmployeeLeaveResponse> => {
    const payload: PostEmployeeLeaveDeleteRequest = {
      Method: 'PostEmployeeLeaveDelete',
      Data: {
        LeaveDetails: JSON.stringify({LeaveId: leaveId}),
      },
      Status: '',
      Message: '',
    };

    const {data} =
      await axiosClient.post<PostEmployeeLeaveResponse>(
        API_POST_DATA_URL,
        payload,
      );

    logger.log(
      '[LeaveService] PostEmployeeLeaveDelete response:',
      JSON.stringify(data, null, 2),
    );

    return data;
  },

  /**
   * Fetches the available leave types from the backend master list.
   */
  getLeaveTypeList: async (): Promise<LeaveType[]> => {
    const response = await callGetList<LeaveType[]>(
      'GetLeaveType',
    );

    logger.log(
      '[LeaveService] GetLeaveType response:',
      JSON.stringify(response, null, 2),
    );

    if (response.IsSuccess && Array.isArray(response.Data)) {
      return response.Data;
    }

    return [];
  },
};
