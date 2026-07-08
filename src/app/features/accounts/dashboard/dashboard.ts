import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AccountsDashboardService, InvoiceSummary, CustomerOutstanding } from '../../../core/services/accounts-dashboard.service';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'Paid'}" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group block cursor-pointer">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-6xl text-green-500">check_circle</span>
          </div>
          <p class="text-sm font-medium text-gray-500 uppercase tracking-wider relative z-10">Paid Invoices</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ summary?.paidInvoices || 0 }}</span>
          </div>
        </a>

        <!-- Partially Paid Invoices -->
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'PartiallyPaid'}" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group block cursor-pointer">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-6xl text-yellow-500">timelapse</span>
          </div>
          <p class="text-sm font-medium text-gray-500 uppercase tracking-wider relative z-10">Partially Paid</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ summary?.partiallyPaidInvoices || 0 }}</span>
          </div>
        </a>

        <!-- Unpaid Invoices -->
        <a [routerLink]="['/accounts/status-invoices']" [queryParams]="{status: 'Unpaid'}" class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group block cursor-pointer">
          <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <span class="material-symbols-outlined text-6xl text-red-500">error</span>
          </div>
          <p class="text-sm font-medium text-gray-500 uppercase tracking-wider relative z-10">Unpaid Invoices</p>
          <div class="mt-4 flex items-baseline gap-2 relative z-10">
            <span class="text-4xl font-extrabold text-gray-900 tracking-tight">{{ summary?.unpaidInvoices || 0 }}</span>
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
              @if (loading) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading outstanding data...</span>
                    </div>
                  </td>
                </tr>
              } @else if (outstandingList.length === 0) {
                <tr>
                  <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                      <p class="text-sm">No outstanding balances found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of outstandingList; track item.customerId) {
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
  summary: InvoiceSummary | null = null;
  outstandingList: CustomerOutstanding[] = [];
  loading = true;

  private dashboardService = inject(AccountsDashboardService);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    
    this.dashboardService.getInvoiceSummary().subscribe({
      next: (data) => {
        this.summary = data;
      },
      error: (err) => console.error('Error fetching summary', err)
    });

    this.dashboardService.getCustomerOutstanding(1, 50).subscribe({
      next: (data) => {
        // Sort by highest outstanding first as requested
        this.outstandingList = (data.items || []).sort((a, b) => b.outstanding - a.outstanding);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching outstanding', err);
        this.loading = false;
      }
    });
  }
}
