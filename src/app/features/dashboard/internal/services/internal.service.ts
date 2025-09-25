import { inject, Injectable } from '@angular/core';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { InternalApplicationResponse } from '../models/internal-application.model';
import { ApplicationStatus } from '../../external/models/external-application.model';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  status?: number;
}

@Injectable({
  providedIn: 'root',
})
export class InternalService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getInternalApplications(params?: PaginationParams) {
    let httpParams = new HttpParams();

    if (params) {
      httpParams = httpParams
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString());

      if (params.searchTerm) {
        httpParams = httpParams.set('searchTerm', params.searchTerm);
      }

      if (params.status !== undefined && params.status !== null) {
        httpParams = httpParams.set('status', (params.status - 1).toString());
      }
    }

    return this.http.get<ApiResponse<PagedResult<InternalApplicationResponse>>>(
      `${this.apiUrl}/application/internal-data`,
      { params: httpParams }
    );
  }

  getApplicationInternalStatus() {
    return this.http.get<ApiResponse<ApplicationStatus[]>>(
      `${this.apiUrl}/application/application-internal-status`
    );
  }
}
