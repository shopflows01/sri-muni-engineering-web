import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CustomerLedgerService, LedgerEntry } from '../../../../core/services/customer-ledger.service';
import { CustomerService } from '../../../../core/services/customer';
import { Customer } from '../../../../shared/models/api.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-ledger-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pt-6">
      
      <div class="flex flex-col gap-5">
        <!-- Top Row: Title & Cards -->
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <a routerLink="/accounts/ledgers" class="btn mt-1 flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium whitespace-nowrap"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back</a>
            <div class="break-words max-w-lg">
              <h1 class="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Ledger: {{ customer?.name || 'Loading...' }}</h1>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-4 shrink-0">
            <div class="bg-white px-5 py-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-start min-w-[150px]">
              <span class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Outstanding</span>
              <span class="text-xl font-bold text-brand">{{ outstanding | currency:'INR' }}</span>
            </div>
            <div class="bg-white px-5 py-3 rounded-lg border border-gray-200 shadow-sm flex flex-col items-start min-w-[150px]">
              <span class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Advance Balance</span>
              <span class="text-xl font-bold text-green-600">{{ advanceBalance | currency:'INR' }}</span>
            </div>
          </div>
        </div>

        <!-- Toolbar: Dates & Export -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-wrap items-end gap-4">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">From Date (Optional)</label>
            <input type="date" [(ngModel)]="fromDate" class="rounded-lg border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm w-40">
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">To Date (Optional)</label>
            <input type="date" [(ngModel)]="toDate" class="rounded-lg border-gray-300 shadow-sm focus:border-brand focus:ring-brand sm:text-sm w-40">
          </div>
          <div class="flex gap-2">
            <button (click)="exportToExcel()" [disabled]="exporting" class="btn flex items-center gap-2 bg-white hover:bg-gray-200 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 transition-all shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              <img src="assets/excel-logo.png" alt="Excel" class="w-5 h-5 object-contain" />
              {{ exporting ? 'Exporting...' : 'Sales Report' }}
            </button>
            <button (click)="exportTransactionStatement()" [disabled]="exportingStatement" class="btn flex items-center gap-2 bg-white hover:bg-gray-200 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 transition-all shadow-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
              <img src="assets/excel-logo.png" alt="Excel" class="w-5 h-5 object-contain" />
              {{ exportingStatement ? 'Exporting...' : 'Transaction Statement' }}
            </button>
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
        
        <app-pagination 
          [page]="pageNumber"
          [pageSize]="pageSize"
          [totalCount]="totalCount"
          (pageChange)="changePage($event)"
          (pageSizeChange)="pageSize = $event; loadLedger()">
        </app-pagination>
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
  pageSize = 25;
  totalCount = 0;
  Math = Math;

  fromDate?: string;
  toDate?: string;
  exporting = false;
  exportingStatement = false;

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id') || '';
    if (this.customerId) {
      this.loadLedger();
    }
  }

  loadLedger() {
    this.loading = true;
    this.ledgerService.getLedger(this.customerId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        try {
          let ledgerData = res as any;
          if (ledgerData && Array.isArray(ledgerData.items) && ledgerData.items.length > 0 && ledgerData.items[0].entries) {
            ledgerData = ledgerData.items[0];
          }

          this.entries = ledgerData?.entries?.items || ledgerData?.items || [];
          this.totalCount = ledgerData?.entries?.totalCount || ledgerData?.totalCount || 0;

          // Use the consolidated data from the API response
          this.customer = { name: ledgerData?.customerName } as Customer;
          this.outstanding = ledgerData?.outstandingAmount || 0;
          this.advanceBalance = ledgerData?.advanceAmount || 0;

          // Debug fallback if entries is still empty
          if (this.entries.length === 0 && ledgerData) {
            console.log("DEBUG LEDGER RES:", res);
          }
        } catch (e) {
          console.error("Mapping error:", e);
        } finally {
          this.loading = false;
        }
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

  exportToExcel() {
    if (!this.customerId) return;

    this.exporting = true;
    this.ledgerService.exportLedgerToExcel(this.customerId, this.fromDate, this.toDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `CustomerLedger_${this.customer?.name?.replace(/[^a-z0-9]/gi, '_') || 'Export'}_${dateStr}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.exporting = false;
      },
      error: (err) => {
        console.error('Failed to export ledger', err);
        this.exporting = false;
        alert('Failed to export Excel. Please try again.');
      }
    });
  }

  exportTransactionStatement() {
    if (!this.customerId) return;

    this.exportingStatement = true;
    this.ledgerService.exportTransactionStatementToExcel(this.customerId, this.fromDate, this.toDate).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const dateStr = new Date().toISOString().slice(0, 10);
        a.download = `TransactionStatement_${this.customer?.name?.replace(/[^a-z0-9]/gi, '_') || 'Export'}_${dateStr}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
        this.exportingStatement = false;
      },
      error: (err) => {
        console.error('Failed to export statement', err);
        this.exportingStatement = false;
        alert('Failed to export Excel. Please try again.');
      }
    });
  }
}

