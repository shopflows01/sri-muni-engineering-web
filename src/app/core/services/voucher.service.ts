import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReceiptVoucher {
  voucherId: string;
  voucherNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  receiptDate: string;
  referenceNumber: string;
  narration: string;
  status: 'Draft' | 'Posted';
  voucherType: string;
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
export class VoucherService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/accounts/receipts`;

  getVouchers(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<PaginatedResult<ReceiptVoucher>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
      
    if (search) {
      params = params.set('search', search);
    }

    return this.http.get<PaginatedResult<ReceiptVoucher>>(this.apiUrl, { params });
  }

  getVoucher(id: string): Observable<ReceiptVoucher> {
    return this.http.get<ReceiptVoucher>(`${this.apiUrl}/${id}`);
  }

  createVoucher(voucher: Partial<ReceiptVoucher>): Observable<{ message: string, voucherId: string, voucherNumber: string }> {
    return this.http.post<{ message: string, voucherId: string, voucherNumber: string }>(this.apiUrl, voucher);
  }

  updateVoucher(id: string, updates: Partial<ReceiptVoucher>): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, updates);
  }

  postVoucher(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/post`, {});
  }
}
