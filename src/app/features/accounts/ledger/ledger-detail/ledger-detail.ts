import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CustomerLedgerService, LedgerEntry } from '../../../../core/services/customer-ledger.service';
import { CustomerService } from '../../../../core/services/customer';
import { Customer } from '../../../../shared/models/api.models';

@Component({
  selector: 'app-ledger-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/ledgers" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back</a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Ledger: {{ customer?.name || 'Loading...' }}</h1>
          </div>
        </div>
        
        <div class="flex gap-4">
          <div class="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col items-end">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Outstanding</span>
            <span class="text-lg font-bold text-brand">{{ outstanding | currency:'INR' }}</span>
          </div>
          <div class="bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm flex flex-col items-end">
            <span class="text-xs text-gray-500 font-medium uppercase tracking-wider">Advance Balance</span>
            <span class="text-lg font-bold text-green-600">{{ advanceBalance | currency:'INR' }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="text-lg font-medium text-gray-900 flex items-center gap-2">
            <span class="material-symbols-outlined text-brand">list_alt</span>
            Ledger Entries
          </h2>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4">Voucher No</th>
                <th class="px-6 py-4">Type</th>
                <th class="px-6 py-4">Narration</th>
                <th class="px-6 py-4 text-right">Debit</th>
                <th class="px-6 py-4 text-right">Credit</th>
                <th class="px-6 py-4 text-right">Running Balance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading) {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading entries...</span>
                    </div>
                  </td>
                </tr>
              } @else if (entries.length === 0) {
                <tr>
                  <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">receipt_long</span>
                      <p class="text-sm">No ledger entries found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (entry of entries; track $index) {
                  <tr class="hover:bg-gray-50/80 transition-colors">
                    <td class="px-6 py-3 text-sm text-gray-900">{{ entry.date | date:'dd MMM yyyy' }}</td>
                    <td class="px-6 py-3 text-sm font-medium text-brand">{{ entry.voucherNumber }}</td>
                    <td class="px-6 py-3 text-sm text-gray-600">
                      <span class="px-2 py-1 rounded-md text-xs font-medium" 
                            [ngClass]="{
                              'bg-blue-100 text-blue-700': entry.voucherType === 'Sales',
                              'bg-green-100 text-green-700': entry.voucherType === 'Receipt',
                              'bg-gray-100 text-gray-700': entry.voucherType !== 'Sales' && entry.voucherType !== 'Receipt'
                            }">
                        {{ entry.voucherType || 'Opening' }}
                      </span>
                    </td>
                    <td class="px-6 py-3 text-sm text-gray-600 max-w-xs truncate" [title]="entry.narration">{{ entry.narration }}</td>
                    <td class="px-6 py-3 text-sm text-right font-medium text-red-600">{{ entry.debit > 0 ? (entry.debit | currency:'INR') : '' }}</td>
                    <td class="px-6 py-3 text-sm text-right font-medium text-green-600">{{ entry.credit > 0 ? (entry.credit | currency:'INR') : '' }}</td>
                    <td class="px-6 py-3 text-sm text-right font-bold text-gray-900">
                      {{ Math.abs(entry.runningBalance) | currency:'INR' }}
                      <span class="text-xs text-gray-500 ml-1 font-normal">{{ entry.runningBalance >= 0 ? 'Dr' : 'Cr' }}</span>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination -->
        @if (totalCount > pageSize) {
          <div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <span class="text-sm text-gray-500">Showing {{ (pageNumber - 1) * pageSize + 1 }} to {{ Math.min(pageNumber * pageSize, totalCount) }} of {{ totalCount }}</span>
            <div class="flex gap-2">
              <button (click)="changePage(pageNumber - 1)" [disabled]="pageNumber === 1" class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors">Previous</button>
              <button (click)="changePage(pageNumber + 1)" [disabled]="pageNumber * pageSize >= totalCount" class="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class LedgerDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private ledgerService = inject(CustomerLedgerService);
  private customerService = inject(CustomerService);
  
  customerId = '';
  customer: Customer | null = null;
  entries: LedgerEntry[] = [];
  outstanding = 0;
  advanceBalance = 0;
  
  loading = true;
  pageNumber = 1;
  pageSize = 20;
  totalCount = 0;
  Math = Math;

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.customerId) {
      this.loadCustomerDetails();
      this.loadLedger();
    }
  }

  loadCustomerDetails() {
    this.customerService.getCustomer(this.customerId).subscribe({
      next: (c) => this.customer = c,
      error: (err) => console.error('Error fetching customer', err)
    });

    this.ledgerService.getOutstanding(this.customerId).subscribe({
      next: (res) => this.outstanding = res.outstanding,
      error: (err) => console.error('Error fetching outstanding', err)
    });

    this.ledgerService.getAdvanceBalance(this.customerId).subscribe({
      next: (res) => this.advanceBalance = res.advanceBalance,
      error: (err) => console.error('Error fetching advance balance', err)
    });
  }

  loadLedger() {
    this.loading = true;
    this.ledgerService.getLedger(this.customerId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.entries = res.items || [];
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading ledger entries', err);
        this.loading = false;
      }
    });
  }

  changePage(newPage: number) {
    this.pageNumber = newPage;
    this.loadLedger();
  }
}

