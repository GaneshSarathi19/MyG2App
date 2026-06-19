import axiosClient from '../api/axiosClient';
import {API_BASE_URL} from '../api/config';
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

    const url = `${API_BASE_URL}/GetData?query=GetEmployeeMasterList&filters=${encodeURIComponent(filters)}`;

    const {data} = await axiosClient.get<EmployeeMasterListResponse>(url);
    return data;
  },
};
