import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AllocationService } from '../../../../core/services/allocation.service';
import { VoucherService, ReceiptVoucher } from '../../../../core/services/voucher.service';
import { CustomerService } from '../../../../core/services/customer';

@Component({
  selector: 'app-allocation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto pt-6 animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/accounts/allocations" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Create Payment Allocation</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 class="text-lg font-medium text-gray-900">Allocation Details</h2>
          <p class="text-sm text-gray-500 mt-1">Map a received payment to an outstanding invoice.</p>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="receiptVoucherId" class="block text-sm font-medium text-gray-700 mb-1">Receipt / Payment Voucher <span class="text-red-500">*</span></label>
              <select id="receiptVoucherId" formControlName="receiptVoucherId" (change)="onReceiptSelected()"
                      class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                <option value="">Select a receipt...</option>
                @for (v of receipts; track v.id) {
                  <option [value]="v.id">{{ v.voucherNumber }} - {{ v.amount | currency:'INR' }} ({{ v.receiptDate | date:'shortDate' }})</option>
                }
              </select>
            </div>

            <div>
              <label for="invoiceId" class="block text-sm font-medium text-gray-700 mb-1">Target Invoice <span class="text-red-500">*</span></label>
              <select id="invoiceId" formControlName="invoiceId" 
                      class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                <option value="">Select an invoice to allocate against...</option>
                <option value="inv1">INV-1001 - Outstanding: ₹5,000.00 (Acme Corp)</option>
                <option value="inv2">INV-1002 - Outstanding: ₹1,200.00 (Tech Solutions)</option>
                <!-- In a real app, these would come from an InvoiceService based on selected customer -->
              </select>
            </div>

            <div>
              <label for="allocatedAmount" class="block text-sm font-medium text-gray-700 mb-1">Allocated Amount <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input type="number" id="allocatedAmount" formControlName="allocatedAmount" min="0" step="0.01"
                       class="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
              </div>
              @if (selectedReceiptAmount > 0) {
                <p class="text-xs text-brand mt-1 font-medium">Max allocatable amount from receipt: {{ selectedReceiptAmount | currency:'INR' }}</p>
              }
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <a routerLink="/accounts/allocations" class="btn btn-outline text-gray-600">Cancel</a>
            <button type="submit" [disabled]="form.invalid || submitting" class="btn btn-primary flex items-center gap-2">
              @if (submitting) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Allocating...
              } @else {
                <span class="material-symbols-outlined text-[20px]">price_check</span>
                Allocate Payment
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class AllocationForm implements OnInit {
  private fb = inject(FormBuilder);
  private allocationService = inject(AllocationService);
  private voucherService = inject(VoucherService);
  private router = inject(Router);

  form: FormGroup;
  receipts: ReceiptVoucher[] = [];
  submitting = false;
  selectedReceiptAmount = 0;

  constructor() {
    this.form = this.fb.group({
      receiptVoucherId: ['', Validators.required],
      invoiceId: ['', Validators.required],
      allocatedAmount: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts() {
    // In a real app we'd fetch only Receipts/Payments that have unallocated amounts
    this.voucherService.getVouchers(1, 50).subscribe({
      next: (res) => {
        this.receipts = res.items;
      }
    });
  }

  onReceiptSelected() {
    const id = this.form.get('receiptVoucherId')?.value;
    const r = this.receipts.find(v => v.id === id);
    if (r) {
      this.selectedReceiptAmount = r.amount;
      this.form.patchValue({ allocatedAmount: r.amount });
    } else {
      this.selectedReceiptAmount = 0;
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting = true;
    const formData = this.form.value;
    
    const receipt = this.receipts.find(v => v.id === formData.receiptVoucherId);
    
    // Mock the invoice number and customer since we don't have real invoice lookups here
    const invoiceNumber = formData.invoiceId === 'inv1' ? 'INV-1001' : 'INV-1002';
    const customerName = formData.invoiceId === 'inv1' ? 'Acme Corp' : 'Tech Solutions';

    this.allocationService.createAllocation({
      receiptVoucherId: formData.receiptVoucherId,
      receiptVoucherNumber: receipt?.voucherNumber || 'Unknown',
      invoiceId: formData.invoiceId,
      invoiceNumber,
      customerName,
      allocatedAmount: Number(formData.allocatedAmount)
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/accounts/allocations']);
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
      }
    });
  }
}
