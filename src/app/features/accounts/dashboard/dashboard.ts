import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountsDashboardService, InvoiceSummary, CustomerOutstanding } from '../../../core/services/accounts-dashboard.service';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Accounts Dashboard</h1>
        <a routerLink="/accounts/management" class="btn btn-primary flex items-center gap-2 shadow-sm">
          <span class="material-symbols-outlined text-[20px]">account_balance_wallet</span>
          Go to Accounts Management
        </a>
      </div>

      <!-- KPI Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Paid Invoices -->
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'Paid'}" class="bg-gradient-to-br from-emerald-50 to-green-100/50 rounded-2xl shadow-sm border border-emerald-200/50 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group block cursor-pointer">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-emerald-200/40 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          <div class="absolute top-4 right-4 text-emerald-500/80 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-5xl">check_circle</span>
          </div>
          <p class="text-xs font-bold text-emerald-800/70 uppercase tracking-wider relative z-10">Paid Invoices</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-emerald-950 tracking-tight">{{ summary()?.paidCount || 0 }}</span>
          </div>
        </a>

        <!-- Partially Paid Invoices -->
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'PartiallyPaid'}" class="bg-gradient-to-br from-amber-50 to-yellow-100/50 rounded-2xl shadow-sm border border-amber-200/50 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group block cursor-pointer">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-amber-200/40 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          <div class="absolute top-4 right-4 text-amber-500/80 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-5xl">timelapse</span>
          </div>
          <p class="text-xs font-bold text-amber-800/70 uppercase tracking-wider relative z-10">Partially Paid</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-amber-950 tracking-tight">{{ summary()?.partiallyPaidCount || 0 }}</span>
          </div>
        </a>

        <!-- Unpaid Invoices -->
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'Unpaid'}" class="bg-gradient-to-br from-red-50 to-rose-100/50 rounded-2xl shadow-sm border border-red-200/50 p-6 flex flex-col justify-between hover:shadow-md hover:-translate-y-1 transition-all relative overflow-hidden group block cursor-pointer">
          <div class="absolute -right-6 -top-6 w-32 h-32 bg-red-200/40 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
          <div class="absolute top-4 right-4 text-red-500/80 group-hover:scale-110 transition-transform">
            <span class="material-symbols-outlined text-5xl">error</span>
          </div>
          <p class="text-xs font-bold text-red-800/70 uppercase tracking-wider relative z-10">Unpaid Invoices</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-red-950 tracking-tight">{{ summary()?.unpaidCount || 0 }}</span>
          </div>
        </a>
      </div>

      <!-- Customer-wise Outstanding List -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-brand">payments</span>
            Customer-wise Outstanding
          </h2>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Customer Name</th>
                <th class="px-6 py-4 text-right">Total Invoiced</th>
                <th class="px-6 py-4 text-right">Total Paid</th>
                <th class="px-6 py-4 text-right text-brand">Outstanding Amount</th>
                <th class="px-6 py-4 text-right text-green-600">Advance Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading()) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading outstanding data...</span>
                    </div>
                  </td>
                </tr>
              } @else if (outstandingList().length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                      <p class="text-sm">No outstanding balances found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of outstandingList(); track item.customerId) {
                  <tr class="hover:bg-gray-50/80 transition-colors group">
                    <td class="px-6 py-4 font-medium text-gray-900">
                      <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xs">
                          {{ item.customerName.charAt(0) }}
                        </div>
                        {{ item.customerName }}
                      </div>
                    </td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ item.totalInvoiced | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right text-gray-600">{{ item.totalPaid | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-brand">{{ item.outstanding | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right font-medium text-green-600">{{ item.advanceBalance > 0 ? (item.advanceBalance | currency:'INR') : '-' }}</td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        <app-pagination 
          [page]="pageNumber()"
          [pageSize]="pageSize()"
          [totalCount]="totalCount()"
          (pageChange)="pageNumber.set($event); loadData()"
          (pageSizeChange)="pageSize.set($event); loadData()">
        </app-pagination>
      </div>
      
      <!-- Bottom CTA (Alternative if they missed the top one) -->
      <div class="flex justify-center mt-8">
        <a routerLink="/accounts/management" class="btn btn-primary px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all flex items-center gap-2 group">
          <span>Go to Accounts Management</span>
          <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
        </a>
      </div>
    </div>
  `
})
export class AccountsDashboard implements OnInit {
  summary = signal<InvoiceSummary | null>(null);
  outstandingList = signal<CustomerOutstanding[]>([]);
  loading = signal(true);
  pageNumber = signal(1);
  pageSize = signal(25);
  totalCount = signal(0);

  private dashboardService = inject(AccountsDashboardService);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    
    this.dashboardService.getInvoiceSummary().subscribe({
      next: (data) => {
        this.summary.set(data);
      },
      error: (err) => console.error('Error fetching summary', err)
    });

    this.dashboardService.getCustomerOutstanding(this.pageNumber(), this.pageSize()).subscribe({
      next: (data) => {
        // Sort by highest outstanding first as requested
        this.outstandingList.set((data.items || []).sort((a, b) => b.outstanding - a.outstanding));
        this.totalCount.set(data.totalCount);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error fetching outstanding', err);
        this.loading.set(false);
      }
    });
  }
}
