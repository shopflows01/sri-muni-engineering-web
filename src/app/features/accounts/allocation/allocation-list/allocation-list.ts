import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AllocationService, Allocation } from '../../../../core/services/allocation.service';

@Component({
  selector: 'app-allocation-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="space-y-6 animate-fade-in max-w-6xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Payment Allocations</h1>
          <p class="text-sm text-gray-500 mt-1">Manage allocations of receipts to invoices.</p>
        </div>
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/management" class="btn btn-outline text-gray-600">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            Back
          </a>
          <a routerLink="/accounts/allocations/new" class="btn btn-primary shadow-sm flex items-center gap-2">
            <span class="material-symbols-outlined text-[20px]">add</span>
            Create New Allocation
          </a>
        </div>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div class="relative w-full max-w-sm">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px]">search</span>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onSearch()" placeholder="Search invoice, receipt or customer..." 
                   class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th class="px-6 py-4">Invoice No</th>
                <th class="px-6 py-4">Receipt Voucher</th>
                <th class="px-6 py-4">Customer</th>
                <th class="px-6 py-4 text-right">Allocated Amount</th>
                <th class="px-6 py-4">Date</th>
                <th class="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              @if (loading) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-2">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
                      <span>Loading allocations...</span>
                    </div>
                  </td>
                </tr>
              } @else if (allocations.length === 0) {
                <tr>
                  <td colspan="6" class="px-6 py-12 text-center text-gray-500">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <span class="material-symbols-outlined text-4xl text-gray-300">price_check</span>
                      <p class="text-sm">No allocations found.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (item of allocations; track item.id) {
                  <tr class="hover:bg-gray-50/80 transition-colors group">
                    <td class="px-6 py-4 font-medium text-gray-900">{{ item.invoiceNumber }}</td>
                    <td class="px-6 py-4 text-brand">{{ item.receiptVoucherNumber }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ item.customerName }}</td>
                    <td class="px-6 py-4 text-right font-semibold text-green-600">{{ item.allocatedAmount | currency:'INR' }}</td>
                    <td class="px-6 py-4 text-gray-600">{{ item.allocationDate | date:'dd MMM yyyy' }}</td>
                    <td class="px-6 py-4 text-center">
                      <a [routerLink]="['/accounts/allocations', item.id]" class="text-brand hover:text-brand-dark transition-colors" title="View">
                        <span class="material-symbols-outlined text-[20px]">visibility</span>
                      </a>
                      <button (click)="editAmount(item)" class="text-amber-500 hover:text-amber-600 transition-colors ml-3" title="Edit Amount">
                        <span class="material-symbols-outlined text-[20px]">edit</span>
                      </button>
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
export class AllocationList implements OnInit {
  allocations: Allocation[] = [];
  loading = true;
  searchTerm = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  Math = Math;

  private allocationService = inject(AllocationService);
  private searchTimeout: any;

  ngOnInit() {
    this.loadAllocations();
  }

  loadAllocations() {
    this.loading = true;
    this.allocationService.getAllocations(this.pageNumber, this.pageSize, this.searchTerm).subscribe({
      next: (res) => {
        this.allocations = res.items || [];
        this.totalCount = res.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load allocations', err);
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
      this.loadAllocations();
    }, 400);
  }

  changePage(newPage: number) {
    this.pageNumber = newPage;
    this.loadAllocations();
  }

  editAmount(item: Allocation) {
    const newAmount = prompt(`Enter new amount for allocation (Current: ${item.allocatedAmount}):`, item.allocatedAmount.toString());
    if (newAmount !== null) {
      const parsed = parseFloat(newAmount);
      if (!isNaN(parsed) && parsed > 0) {
        this.loading = true;
        this.allocationService.updateAllocation(item.id, parsed).subscribe({
          next: () => {
            this.loadAllocations();
          },
          error: (err) => {
            console.error('Failed to update allocation', err);
            alert('Failed to update allocation amount.');
            this.loading = false;
          }
        });
      } else {
        alert('Invalid amount. Must be greater than 0.');
      }
    }
  }
}
