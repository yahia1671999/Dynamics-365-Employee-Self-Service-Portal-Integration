/**
 * Microsoft Dynamics 365 Leave and Absence Integration API
 * Handles Leave Balances, Requests, Transactions, and Substitute Delegates
 * Maps to D365 OData:
 * - /data/LeaveAndAbsenceBankTransactions
 * - /data/LeaveAndAbsenceRequests
 * - /data/LeaveAndAbsencePlans
 */

import { apiClient, ApiResponse } from './apiClient';
import { authService } from '../authService';
import {
  LeaveBalance,
  LeaveMovementTransaction,
  LeaveRequest,
  DelegatedEmployee,
  LeaveTypeCode,
} from '../../types/d365.types';

export class LeaveApi {
  /**
   * Fetches official leave balances
   * D365 OData: GET /data/LeaveAndAbsenceBankTransactions?$filter=WorkerPersonnelNumber eq '{id}'
   */
  public async getLeaveBalances(
    personnelNumber?: string
  ): Promise<ApiResponse<LeaveBalance[]>> {
    const id = personnelNumber || authService.getCurrentUser()?.id || '';
    const query = id ? `?workerId=${encodeURIComponent(id)}` : '';
    return apiClient.get<LeaveBalance[]>(`/leave-balances${query}`);
  }

  /**
   * Fetches leave movement history transactions (accruals, consumptions, adjustments)
   */
  public async getLeaveTransactions(
    leaveTypeCode?: LeaveTypeCode,
    personnelNumber?: string
  ): Promise<ApiResponse<LeaveMovementTransaction[]>> {
    const id = personnelNumber || authService.getCurrentUser()?.id || '';
    const query = new URLSearchParams();
    if (id) {
      query.set('workerId', id);
    }
    if (leaveTypeCode) {
      query.set('typeCode', leaveTypeCode);
    }
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return apiClient.get<LeaveMovementTransaction[]>(`/leave-transactions${queryString}`);
  }

  /**
   * Fetches submitted leave requests
   * D365 OData: GET /data/LeaveAndAbsenceRequests?$filter=WorkerPersonnelNumber eq '{id}'
   */
  public async getLeaveRequests(
    personnelNumber?: string
  ): Promise<ApiResponse<LeaveRequest[]>> {
    const id = personnelNumber || authService.getCurrentUser()?.id || '';
    const query = id ? `?workerId=${encodeURIComponent(id)}` : '';
    return apiClient.get<LeaveRequest[]>(`/leave-requests${query}`);
  }

  /**
   * Fetches eligible substitute / delegated employees for delegation
   */
  public async getDelegatedEmployees(): Promise<ApiResponse<DelegatedEmployee[]>> {
    return apiClient.get<DelegatedEmployee[]>('/delegated-employees');
  }

  /**
   * Submits a new leave request to Dynamics 365 workflow
   * D365 OData: POST /data/LeaveAndAbsenceRequests
   */
  public async submitLeaveRequest(
    requestData: Omit<LeaveRequest, 'id' | 'submissionDate' | 'status' | 'statusAr'>
  ): Promise<ApiResponse<LeaveRequest>> {
    return apiClient.post<LeaveRequest>('/leave-requests', requestData);
  }

  /**
   * Cancels a pending leave request
   */
  public async cancelLeaveRequest(requestId: string): Promise<ApiResponse<boolean>> {
    return apiClient.delete<boolean>(`/leave-requests/${encodeURIComponent(requestId)}`);
  }
}

export const leaveApi = new LeaveApi();
