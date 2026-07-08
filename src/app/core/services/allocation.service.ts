import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { getLocalIsoString } from '../../shared/utils/date-utils';

export interface Allocation {
  id: string;
  receiptVoucherId: string;
  receiptVoucherNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerName: string;
  allocatedAmount: number;
  allocationDate: string;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class AllocationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts/allocations`;

  getAllocations(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<PaginatedResult<Allocation>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
      
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResult<Allocation>>(this.apiUrl, { params });
  }

  getAllocation(id: string): Observable<Allocation> {
    return this.http.get<Allocation>(`${this.apiUrl}/${id}`);
  }

  createAllocation(payload: { receiptVoucherId: string, receiptVoucherNumber: string, invoiceId: string, invoiceNumber: string, customerName: string, allocatedAmount: number }): Observable<Allocation> {
    // Actually we only need receiptVoucherId, invoiceId and amount for the backend, but we'll post to the actual endpoint
    return this.http.post<Allocation>(`${environment.apiUrl}/accounts/receipts/${payload.receiptVoucherId}/allocate`, {
      allocations: [
        { invoiceId: payload.invoiceId, amount: payload.allocatedAmount }
      ]
    });
  }

  updateAllocation(id: string, amount: number): Observable<any> {
    // Call the actual backend PUT API
    return this.http.put(`${this.apiUrl}/${id}`, { amount });
  }
}
