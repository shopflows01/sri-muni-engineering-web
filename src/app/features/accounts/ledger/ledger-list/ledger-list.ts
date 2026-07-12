import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AccountsDashboardService, CustomerOutstanding } from '../../../../core/services/accounts-dashboard.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-ledger-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, PaginationComponent],
  template: `
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Customer Ledgers</h1>
          <p class="text-sm text-gray-500 mt-1">View and manage customer running balances and entries.</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/management" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </a>
          <a routerLink="/accounts/ledgers/new" class="btn btn-primary shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">add</span>
            Create New Ledger
          </a>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="relative w-full max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search customers..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Customer Name</th>
                <th class="px-6 py-4 text-right">Total Invoiced</th>
                <th class="px-6 py-4 text-right">Total Paid</th>
                <th class="px-6 py-4 text-right">Current Balance</th>
                <th class="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading ledgers...</span>
                    </div>
                  </td>
                </tr>
              } @else if (ledgers.length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">auto_stories</span>
                      <p class="text-sm">No ledgers found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of ledgers; track item.customerId) {
                  <tr class="hover:bg-gray-50/80 transition-colors group">
                    <td class="px-6 py-4 font-medium text-gray-900">
                      {{ item.customerName }}
                    </td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ item.totalInvoiced | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ item.totalPaid | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right">
                      @if (item.outstanding > 0) {
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-600 font-medium whitespace-nowrap">
                          <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          {{ item.outstanding | currency:'INR' }} (Dr)
                        </span>
                      } @else if (item.advanceBalance > 0) {
                        <span class="font-semibold text-green-600">{{ item.advanceBalance | currency:'INR' }} (Cr)</span>
                      } @else {
                        <span class="font-semibold text-gray-600">₹0.00</span>
                      }
                    </td>
                    <td class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <a [routerLink]="['/accounts/ledgers', item.customerId]" class="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium text-xs rounded-md transition-colors border border-gray-200 shadow-sm" title="View">
                          <span class="material-symbols-outlined text-[16px]">visibility</span>
                          <span class="hidden lg:inline">View</span>
                        </a>
                        <a [routerLink]="['/accounts/ledgers', item.customerId]" class="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium text-xs rounded-md transition-colors border border-emerald-200 shadow-sm" title="Export Excel">
                          <img src="assets/excel-logo.png" alt="Excel" class="w-4 h-4 object-contain" />
                          <span class="hidden xl:inline">Export</span>
                        </a>
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
          (pageSizeChange)="pageSize = $event; loadLedgers()">
        </app-pagination>
      </div>
    </div>
  `
})
export class LedgerList implements OnInit {
  ledgers: CustomerOutstanding[] = [];
  loading = true;
  searchTerm = '';
  pageNumber = 1;
  pageSize = 25;
  totalCount = 0;
  Math = Math;

  private dashboardService = inject(AccountsDashboardService);
  private searchTimeout: any;

  ngOnInit() {
    this.loadLedgers();
  }

  loadLedgers() {
    this.loading = true;
    this.dashboardService.getCustomerOutstanding(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.ledgers = res.items || [];
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load ledgers', err);
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
      this.loadLedgers();
    }, 400);
  }

  changePage(newPage: number) {
    this.pageNumber = newPage;
    this.loadLedgers();
  }
}


