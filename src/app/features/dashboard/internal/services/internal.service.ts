import { inject, Injectable } from '@angular/core';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import {
  ApplicationDetails,
  InternalApplicationResponse,
} from '../models/internal-application.model';
import {
  ApplicationStatus,
  ExternalApplicationResponse,
} from '../../external/models/external-application.model';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
  internalStatus?: number;
  externalStatus?: number;
  partnershipSource?: number;
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

      if (params.internalStatus !== undefined && params.internalStatus !== null) {
        httpParams = httpParams.set('internalStatus', (params.internalStatus - 1).toString());
      }
      if (params.externalStatus !== undefined && params.externalStatus !== null) {
        httpParams = httpParams.set('externalStatus', (params.externalStatus - 1).toString());
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
  getApplicationExternalStatus() {
    return this.http.get<ApiResponse<ApplicationStatus[]>>(
      `${this.apiUrl}/application/application-external-status`
    );
  }
  getApplicationDetails(applicationId: string) {
    return this.http.get<ApiResponse<ApplicationDetails>>(
      `${this.apiUrl}/application/internal-data/${applicationId}`
    );
  }
  sendFormData(applicationId: string) {
    return this.http.post<ApiResponse<void>>(
      `${this.apiUrl}/application/${applicationId}/send-form-data`,
      {}
    );
  }
  getExternalAdmins(params?: PaginationParams) {
    let httpParams = new HttpParams();

    if (params) {
      httpParams = httpParams
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString());

      if (params.searchTerm) {
        httpParams = httpParams.set('searchTerm', params.searchTerm);
      }

      if (params.externalStatus !== undefined && params.externalStatus !== null) {
        httpParams = httpParams.set('externalStatus', (params.externalStatus - 1).toString());
      }

      if (params.partnershipSource !== undefined && params.partnershipSource !== null) {
        httpParams = httpParams.set('partnershipSource', params.partnershipSource.toString());
      }
    }
    return this.http.get<ApiResponse<PagedResult<ExternalApplicationResponse>>>(
      `${this.apiUrl}/application/external-data/admins`,
      { params: httpParams }
    );
  }
}
