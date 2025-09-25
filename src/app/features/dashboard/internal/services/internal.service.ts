import { inject, Injectable } from '@angular/core';
import { ApiResponse, PagedResult } from '../../../../core/models/api-response.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { InternalApplicationResponse } from '../models/internal-application.model';

export interface PaginationParams {
  pageNumber: number;
  pageSize: number;
  searchTerm?: string;
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
    }

    return this.http.get<ApiResponse<PagedResult<InternalApplicationResponse>>>(
      `${this.apiUrl}/application/internal-data`,
      { params: httpParams }
    );
  }
}
