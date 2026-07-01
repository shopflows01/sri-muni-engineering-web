import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Customer } from '../../shared/models/api.models';
import { Observable } from 'rxjs';

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/customer`;

  getCustomers(search?: string, page = 1, pageSize = 10): Observable<PaginatedResponse<Customer>> {
    let params = new HttpParams()
      .set('Page', page)
      .set('PageSize', pageSize);
      
    if (search) {
      params = params.set('Search', search);
    }
    
    return this.http.get<PaginatedResponse<Customer>>(this.apiUrl, { params });
  }

  getCustomer(id: string): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  createCustomer(customer: Partial<Customer>): Observable<Customer> {
    return this.http.post<Customer>(this.apiUrl, customer);
  }

  updateCustomer(id: string, customer: Partial<Customer>): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
  }
}
