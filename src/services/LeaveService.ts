import axiosClient from '../api/axiosClient';
import {API_BASE_URL, API_POST_DATA_URL} from '../api/config';
import {logger} from '../utils/logger';
import {store} from '../redux/store';
import {
  LeaveDetail,
  PostEmployeeLeaveRequest,
  PostEmployeeLeaveResponse,
  EmployeeLeaveSummaryResponse,
  UpdateLeaveDetail,
  PostEmployeeLeaveUpdateRequest,
  PostEmployeeLeaveDeleteRequest,
} from '../api/interfaces/LeaveTypes';

/**
 * Service for all leave-related API operations.
 */
export const LeaveService = {
  /**
   * Submits a new leave request to the backend.
   *
   * @param detail - The complete leave detail object to submit.
   * @returns Promise resolving to the backend leave response.
   */
  postEmployeeLeave: async (
    detail: LeaveDetail,
  ): Promise<PostEmployeeLeaveResponse> => {
    const payload: PostEmployeeLeaveRequest = {
      Method: 'PostEmployeeLeave',
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
      '[LeaveService] PostEmployeeLeave response:',
      JSON.stringify(data, null, 2),
    );

    return data;
  },

  /**
   * Fetches the employee leave summary from the backend.
   *
   * @returns Promise resolving to the leave summary response.
   */
  getEmployeeLeaveSummary: async (): Promise<EmployeeLeaveSummaryResponse> => {
    const token = store.getState().auth.authToken;

    const filters = JSON.stringify({
      Token: token,
    });

    const url = `${API_BASE_URL}/GetData?query=GetEmployeeLeaveSummary&filters=${encodeURIComponent(filters)}`;

    const {data} =
      await axiosClient.get<EmployeeLeaveSummaryResponse>(url);

    logger.log(
      '[LeaveService] GetEmployeeLeaveSummary response:',
      JSON.stringify(data, null, 2),
    );

    return data;
  },

  /**
   * Updates an existing leave request.
   *
   * @param detail - The update leave detail object to submit.
   * @returns Promise resolving to the backend generic response.
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
   *
   * @param leaveId - The unique identifier of the leave to delete.
   * @returns Promise resolving to the backend generic response.
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
};
