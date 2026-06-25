import axiosClient from '../api/axiosClient';
import {EmployeeMasterListResponse} from '../api/interfaces/EmployeeTypes';
import {store} from '../redux/store';

/**
 * Service for employee-related API operations.
 */
export const EmployeeService = {
  /**
   * Fetches the complete employee master list from the backend.
   *
   * @returns Promise resolving to the employee master list response.
   */
  getEmployeeMasterList: async (): Promise<EmployeeMasterListResponse> => {
    const token = store.getState().auth.authToken;

    const filters = JSON.stringify({
      Token: token,
      IsActive: 'true',
    });

    const {data} = await axiosClient.get<EmployeeMasterListResponse>(
      `/GetData?query=GetEmployeeMasterList&filters=${encodeURIComponent(filters)}`,
    );
    return data;
  },
};
