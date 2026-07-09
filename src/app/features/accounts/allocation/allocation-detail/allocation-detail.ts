import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { AllocationService, Allocation } from '../../../../core/services/allocation.service';

@Component({
  selector: 'app-allocation-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="space-y-6 animate-fade-in max-w-4xl mx-auto pt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a routerLink="/accounts/allocations" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium"><span class="material-symbols-outlined text-[20px]">arrow_back</span>Back</a>
          <div>
            <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Allocation Details</h1>
            <p class="text-sm text-gray-500 mt-1">Payment to Invoice Mapping</p>
          </div>
        </div>
        <div class="flex items-center gap-2" *ngIf="allocation">
          <button (click)="editAmount()" class="btn flex items-center gap-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:text-gray-900 shadow-sm rounded-lg transition-all font-medium">
            <span class="material-symbols-outlined text-[18px]">edit</span>
            Edit Amount
          </button>
        </div>
      </div>

      @if (loading) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          <span>Loading allocation details...</span>
        </div>
      } @else if (allocation) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="p-6 bg-brand/5 border-b border-brand/10 flex justify-between items-center">
            <div>
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Customer</p>
              <h2 class="text-xl font-bold text-gray-900">{{ allocation.customerName }}</h2>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Date</p>
              <p class="font-medium text-gray-900">{{ allocation.allocationDate | date:'mediumDate' }}</p>
            </div>
          </div>
          
          <div class="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative">
            <!-- Receipt Side -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center relative z-10 shadow-sm">
              <span class="material-symbols-outlined text-4xl text-gray-400 mb-3">receipt_long</span>
              <p class="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Receipt Voucher</p>
              <a [routerLink]="['/accounts/vouchers', allocation.receiptVoucherId]" class="text-lg font-bold text-brand hover:underline">{{ allocation.receiptVoucherNumber }}</a>
            </div>
            
            <!-- Connection Line & Amount -->
            <div class="flex flex-col items-center justify-center relative">
              <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-gray-200 -z-10 hidden md:block"></div>
              <div class="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-brand scale-x-0 origin-left animate-expand -z-10 hidden md:block"></div>
              
              <div class="bg-white px-6 py-4 rounded-full border-2 border-brand shadow-md relative z-10">
                <span class="block text-[10px] text-brand font-bold uppercase tracking-widest text-center mb-1">Allocated</span>
                <span class="text-2xl font-black text-gray-900">{{ allocation.allocatedAmount | currency:'INR' }}</span>
              </div>
              
              <span class="material-symbols-outlined text-brand mt-4 hidden md:block animate-bounce-x">arrow_forward</span>
              <span class="material-symbols-outlined text-brand my-4 md:hidden animate-bounce-y">arrow_downward</span>
            </div>
            
            <!-- Invoice Side -->
            <div class="bg-gray-50 p-6 rounded-xl border border-gray-100 text-center relative z-10 shadow-sm">
              <span class="material-symbols-outlined text-4xl text-gray-400 mb-3">description</span>
              <p class="text-sm text-gray-500 font-medium uppercase tracking-wider mb-2">Target Invoice</p>
              <a [routerLink]="['/invoices', allocation.invoiceId]" class="text-lg font-bold text-brand hover:underline">{{ allocation.invoiceNumber }}</a>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AllocationDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private allocationService = inject(AllocationService);

  allocationId = '';
  allocation: Allocation | null = null;
  loading = true;

  ngOnInit() {
    this.allocationId = this.route.snapshot.paramMap.get('id') || '';
    if (this.allocationId) {
      this.loadAllocation();
    }
  }

  loadAllocation() {
    this.loading = true;
    this.allocationService.getAllocation(this.allocationId).subscribe({
      next: (a) => {
        this.allocation = a;
        this.loading = false;
      },
      error: () => {
        alert('Allocation not found');
        this.router.navigate(['/accounts/allocations']);
      }
    });
  }

  editAmount() {
    if (!this.allocation) return;
    const newAmount = prompt(`Enter new amount for allocation (Current: ${this.allocation.allocatedAmount}):`, this.allocation.allocatedAmount.toString());
    if (newAmount !== null) {
      const parsed = parseFloat(newAmount);
      if (!isNaN(parsed) && parsed > 0) {
        this.loading = true;
        this.allocationService.updateAllocation(this.allocation.id, parsed).subscribe({
          next: () => {
            this.loadAllocation();
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


