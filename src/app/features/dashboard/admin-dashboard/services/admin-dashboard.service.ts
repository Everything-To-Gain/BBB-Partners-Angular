import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';
import {
  AdminDashboardUpdateUserRequest,
  AdminDashboardUser,
  CreateAdminDashboardUser,
} from '../models/admin-dashboard.model';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  isAdmin?: boolean;
  isCSVSync?: boolean;
  isActive?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminDashboardService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAdminDashboardUsers(
    params?: PaginationParams
  ): Observable<ApiResponse<PagedResult<AdminDashboardUser>>> {
    let httpParams = new HttpParams();

    if (params) {
      httpParams = httpParams
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString());

      if (params.searchTerm) {
        httpParams = httpParams.set('searchTerm', params.searchTerm);
      }
      if (params.isAdmin) {
        httpParams = httpParams.set('isAdmin', params.isAdmin.toString());
      }
      if (params.isCSVSync) {
        httpParams = httpParams.set('isCSVSync', params.isCSVSync.toString());
      }
      if (params.isActive) {
        httpParams = httpParams.set('isActive', params.isActive.toString());
      }
    }
    return this.http.get<ApiResponse<PagedResult<AdminDashboardUser>>>(
      `${this.apiUrl}/user/admin-dashboard`,
      { params: httpParams }
    );
  }

  deleteAdminDashboardUser(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/user/admin-dashboard/${id}`);
  }

  createAdminDashboardUser(request: CreateAdminDashboardUser): Observable<ApiResponse<void>> {
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/user/admin-dashboard`, request);
  }

  createAdminDashboardUsers({ usersCsv }: { usersCsv: string }): Observable<ApiResponse<void>> {
    // Backend expects a string body; send as text/plain
    return this.http.post<ApiResponse<void>>(`${this.apiUrl}/user/admin-dashboard/batch`, {
      usersCsv,
    });
  }

  updateAdminDashboardUser(
    id: string,
    request: AdminDashboardUpdateUserRequest
  ): Observable<ApiResponse<void>> {
    return this.http.patch<ApiResponse<void>>(`${this.apiUrl}/user/admin-dashboard/${id}`, request);
  }
}
