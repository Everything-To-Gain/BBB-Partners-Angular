import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../core/models/api-response.model';
import { TobItem } from '../models/tob.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AccreditationFormService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  submitAccreditationForm(formData: any) {
    return this.http.post(`${this.apiUrl}/application/submit-form`, formData);
  }

  getVisualData(searchTerm?: string): Observable<ApiResponse<TobItem[]>> {
    if (searchTerm)
      return this.http.get<ApiResponse<TobItem[]>>(
        `${this.apiUrl}/visualdata/type-of-business?searchTerm=${searchTerm}`
      );
    return this.http.get<ApiResponse<TobItem[]>>(`${this.apiUrl}/visualdata/type-of-business`);
  }
}
