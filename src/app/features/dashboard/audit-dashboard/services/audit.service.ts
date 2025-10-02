import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { AuditLog } from '../models/audit.model';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';

export interface AuditPaginationRequest {
  pageNumber?: number;
  pageSize?: number;
  searchTerm?: string;
  user?: string;
  status?: string;
  entity?: string;
  action?: string;
  userVersion?: string;
  dateFrom?: string; // ISO string
  dateTo?: string; // ISO string
}

@Injectable({
  providedIn: 'root',
})
export class AuditService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAudit(id: string): Observable<ApiResponse<AuditLog>> {
    return this.http.get<ApiResponse<AuditLog>>(`${this.apiUrl}/Audit/${id}`);
  }

  getAllFilteredAudits(
    request: AuditPaginationRequest
  ): Observable<ApiResponse<PagedResult<AuditLog>>> {
    let params = new HttpParams();
    if (request.pageNumber !== undefined)
      params = params.set('pageNumber', String(request.pageNumber));
    if (request.pageSize !== undefined) params = params.set('pageSize', String(request.pageSize));
    if (request.searchTerm) params = params.set('searchTerm', request.searchTerm);
    if (request.user) params = params.set('user', request.user);
    if (request.status) params = params.set('status', request.status);
    if (request.entity) params = params.set('entity', request.entity);
    if (request.action) params = params.set('action', request.action);
    if (request.userVersion) params = params.set('userVersion', request.userVersion);
    if (request.dateFrom) {
      const from =
        request.dateFrom.length === 10 ? `${request.dateFrom}T00:00:00Z` : request.dateFrom;
      params = params.set('fromDate', from);
    }
    if (request.dateTo) {
      const to = request.dateTo.length === 10 ? `${request.dateTo}T23:59:59.999Z` : request.dateTo;
      params = params.set('toDate', to);
    }

    return this.http.get<ApiResponse<PagedResult<AuditLog>>>(`${this.apiUrl}/Audit`, { params });
  }

  getUsers(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/Audit/users`);
  }

  getStatuses(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/Audit/statuses`);
  }

  getUserVersions(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/Audit/user-versions`);
  }

  getEntities(): Observable<ApiResponse<string[]>> {
    return this.http.get<ApiResponse<string[]>>(`${this.apiUrl}/Audit/entities`);
  }
}
