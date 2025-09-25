import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';
import { ExternalApplicationResponse } from '../models/external-application.model';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExternalService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getExternalApplications(params?: PaginationParams) {
    let httpParams = new HttpParams();

    if (params) {
      httpParams = httpParams
        .set('pageNumber', params.pageNumber.toString())
        .set('pageSize', params.pageSize.toString());

      if (params.searchTerm) {
        httpParams = httpParams.set('searchTerm', params.searchTerm);
      }
    }

    return this.http.get<ApiResponse<PagedResult<ExternalApplicationResponse>>>(
      `${this.apiUrl}/application/external-data`,
      { params: httpParams }
    );
  }
}
