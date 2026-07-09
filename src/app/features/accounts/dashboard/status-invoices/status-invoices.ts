import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-status-invoices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in">
      <div class="flex items-center gap-4">
        <a routerLink="/accounts/dashboard" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back</a>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ status }} Invoices</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Invoice No</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4 text-right">Total Amount</th>
                <th class="px-6 py-4 text-right text-brand">Allocated Amount</th>
                <th class="px-6 py-4 text-right text-red-600">Outstanding</th>
                <th class="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading invoices...</span>
                    </div>
                  </td>
                </tr>
              } @else if (invoices.length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">receipt</span>
                      <p class="text-sm">No {{ status }} invoices found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (inv of invoices; track inv.invoiceId) {
                  <tr class="hover:bg-gray-50/80 transition-colors group">
                    <td class="px-6 py-4 font-medium text-brand">
                      <a [routerLink]="['/invoices', inv.invoiceId]">{{ inv.invoiceNumber }}</a>
                    </td>
                    <td class="px-6 py-4 text-gray-600">{{ inv.invoiceDate | date:'mediumDate' }}</td>
                    <td class="px-6 py-4 text-right text-gray-900">{{ inv.invoiceTotal | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right text-green-600">{{ inv.allocatedAmount | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-red-600">{{ inv.outstanding | currency:'INR' }}</td>
                    <td class="px-6 py-4">
                      <span class="px-2.5 py-1 rounded-full text-xs font-semibold"
                        [ngClass]="{
                          'bg-green-100 text-green-700': inv.status === 'Paid',
                          'bg-yellow-100 text-yellow-700': inv.status === 'PartiallyPaid',
                          'bg-red-100 text-red-700': inv.status === 'Unpaid'
                        }">
                        {{ inv.status }}
                      </span>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
        
        <!-- Pagination controls -->
        <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div class="text-sm text-gray-500">
            Showing <span class="font-medium text-gray-900">{{ (pageNumber - 1) * pageSize + (invoices.length > 0 ? 1 : 0) }}</span> to <span class="font-medium text-gray-900">{{ (pageNumber - 1) * pageSize + invoices.length }}</span> of <span class="font-medium text-gray-900">{{ totalCount }}</span> results
          </div>
          <div class="flex items-center gap-2">
            <button class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium" [disabled]="pageNumber === 1" (click)="loadPage(pageNumber - 1)">Previous</button>
            <button class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium" [disabled]="pageNumber === totalPages || totalPages === 0" (click)="loadPage(pageNumber + 1)">Next</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class StatusInvoices implements OnInit {
  status = '';
  invoices: any[] = [];
  loading = true;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.status = params['status'] || 'Unpaid';
      this.loadInvoices();
    });
  }

  loadInvoices() {
    this.loading = true;
    let params = new HttpParams()
      .set('status', this.status)
      .set('pageNumber', this.pageNumber.toString())
      .set('pageSize', this.pageSize.toString());

    this.http.get<any>(`${environment.apiUrl}/accounts/invoices/status`, { params }).subscribe({
      next: (res) => {
        this.invoices = res.items || [];
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadPage(page: number) {
    this.pageNumber = page;
    this.loadInvoices();
  }
}


