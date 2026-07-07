import { Injectable, inject } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

  private allocations: Allocation[] = [
    {
      id: 'a1',
      receiptVoucherId: 'v2',
      receiptVoucherNumber: 'V-2026-002',
      invoiceId: 'inv1',
      invoiceNumber: 'INV-1001',
      customerName: 'Acme Corp',
      allocatedAmount: 5000,
      allocationDate: getLocalIsoString()
    }
  ];

  getAllocations(pageNumber: number = 1, pageSize: number = 10, search: string = ''): Observable<PaginatedResult<Allocation>> {
    let filtered = this.allocations;
    if (search) {
      filtered = filtered.filter(a => 
        a.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || 
        a.customerName.toLowerCase().includes(search.toLowerCase()) ||
        a.receiptVoucherNumber.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    const start = (pageNumber - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);
    
    return of({
      items,
      totalCount: filtered.length,
      pageNumber,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }).pipe(delay(400));
  }

  getAllocation(id: string): Observable<Allocation> {
    const a = this.allocations.find(a => a.id === id);
    if (a) return of(a).pipe(delay(300));
    return throwError(() => new Error('Allocation not found'));
  }

  createAllocation(payload: { receiptVoucherId: string, receiptVoucherNumber: string, invoiceId: string, invoiceNumber: string, customerName: string, allocatedAmount: number }): Observable<Allocation> {
    const newAllocation: Allocation = {
      id: Math.random().toString(36).substring(7),
      ...payload,
      allocationDate: getLocalIsoString()
    };
    this.allocations = [newAllocation, ...this.allocations];
    return of(newAllocation).pipe(delay(500));
  }

  updateAllocation(id: string, amount: number): Observable<any> {
    // Call the actual backend PUT API
    return this.http.put(`${this.apiUrl}/${id}`, { amount });
  }
}
