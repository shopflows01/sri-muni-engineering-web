import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VoucherService, ReceiptVoucher } from '../../../../core/services/voucher.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-voucher-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Vouchers</h1>
          <p class="text-sm text-gray-500 mt-1">Manage customer receipts and debit notes.</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/management" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </a>
          <a routerLink="/accounts/vouchers/new" class="btn btn-primary shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">add</span>
            Create Voucher
          </a>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="relative w-full max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search voucher number or customer..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Voucher No</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Customer</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 text-right">Amount</th>
                <th class="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading) {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading vouchers...</span>
                    </div>
                  </td>
                </tr>
              } @else if (vouchers.length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                      <p class="text-sm">No vouchers found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of vouchers; track item.voucherId) {
                  <tr class="hover:bg-gray-50/80 transition-colors group">
                    <td class="px-6 py-4 font-medium text-brand">{{ item.voucherNumber }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ item.receiptDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-6 py-4 text-gray-900">{{ item.customerName || 'Unknown Customer' }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-xs font-medium"
                            [ngClass]="item.voucherType === 'Sales' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'">
                        {{ item.voucherType === 'Sales' ? 'Debit' : 'Receipt' }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="px-2 py-1 rounded-full text-xs font-medium"
                            [ngClass]="item.status === 'Posted' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'">
                        {{ item.status || 'Draft' }}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right font-semibold text-gray-900">{{ item.amount | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <a [routerLink]="['/accounts/vouchers', item.voucherId]" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-md transition-colors border border-gray-200 shadow-sm" title="View">
                          <span class="material-symbols-outlined text-[16px]">visibility</span>
                          <span class="hidden lg:inline">View</span>
                        </a>
                        @if (item.status === 'Draft') {
                          <a [routerLink]="['/accounts/vouchers', item.voucherId, 'edit']" class="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-xs rounded-md transition-colors border border-blue-200 shadow-sm" title="Edit">
                            <span class="material-symbols-outlined text-[16px]">edit</span>
                            <span class="hidden lg:inline">Edit</span>
                          </a>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        <app-pagination 
          [page]="pageNumber"
          [pageSize]="pageSize"
          [totalCount]="totalCount"
          (pageChange)="changePage($event)"
          (pageSizeChange)="pageSize = $event; loadVouchers()">
        </app-pagination>
      </div>
    </div>
  `
})
export class VoucherList implements OnInit {
  vouchers: ReceiptVoucher[] = [];
  loading = true;
  searchTerm = '';
  pageNumber = 1;
  pageSize = 25;
  totalCount = 0;
  Math = Math;

  private voucherService = inject(VoucherService);
  private searchTimeout: any;

  ngOnInit() {
    this.loadVouchers();
  }

  loadVouchers() {
    this.loading = true;
    this.voucherService.getVouchers(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.vouchers = res.items || [];
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load receipts', err);
        this.loading = false;
      }
    });
  }

  onSearch() {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
    this.searchTimeout = setTimeout(() => {
      this.pageNumber = 1;
      this.loadVouchers();
    }, 400);
  }

  changePage(newPage: number) {
    this.pageNumber = newPage;
    this.loadVouchers();
  }
}


