import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { VoucherService } from '../../../../core/services/voucher.service';
import { CustomerService } from '../../../../core/services/customer';
import { getLocalDateString } from '../../../../shared/utils/date-utils';

@Component({
  selector: 'app-voucher-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-3xl mx-auto pt-6 animate-fade-in pb-12">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/accounts/vouchers" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">{{ isEdit ? 'Edit Receipt' : 'Create Customer Receipt' }}</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-medium text-gray-900">Receipt Details</h2>
            <p class="text-sm text-gray-500 mt-1">Record a payment received from a customer.</p>
          </div>
          @if (isEdit) {
            <span class="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Draft</span>
          }
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="md:col-span-2">
              <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer / Ledger <span class="text-red-500">*</span></label>
              <select id="customerId" formControlName="customerId" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                <option value="">Select a customer...</option>
                @for (c of customers; track c.id) {
                  <option [value]="c.id">{{ c.name }} (Ledger: {{ c.ledgerNo || 'N/A' }})</option>
                }
              </select>
              @if (form.get('customerId')?.invalid && form.get('customerId')?.touched) {
                <p class="text-xs text-red-500 mt-1">Customer is required</p>
              }
            </div>

            <div>
              <label for="amount" class="block text-sm font-medium text-gray-700 mb-1">Receipt Amount <span class="text-red-500">*</span></label>
              <div class="relative">
                <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input type="number" id="amount" formControlName="amount" min="1" step="0.01" class="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
              </div>
              @if (form.get('amount')?.invalid && form.get('amount')?.touched) {
                <p class="text-xs text-red-500 mt-1">Amount is required and must be greater than 0</p>
              }
            </div>
            
            <div>
              <label for="receiptDate" class="block text-sm font-medium text-gray-700 mb-1">Date <span class="text-red-500">*</span></label>
              <input type="date" id="receiptDate" formControlName="receiptDate" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
            </div>

            <div class="md:col-span-2">
              <label for="referenceNumber" class="block text-sm font-medium text-gray-700 mb-1">Reference No (Cheque/Txn No)</label>
              <input type="text" id="referenceNumber" formControlName="referenceNumber" placeholder="e.g. CHQ-1234 or UTR-5678" class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
            </div>
            
            <div class="md:col-span-2">
              <label for="narration" class="block text-sm font-medium text-gray-700 mb-1">Narration</label>
              <textarea id="narration" formControlName="narration" rows="3" placeholder="Brief description of the receipt..." class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm resize-none"></textarea>
            </div>
          </div>

          <div class="pt-6 mt-6 flex justify-end gap-3 border-t border-gray-100">
            <a routerLink="/accounts/vouchers" class="btn btn-outline text-gray-600">Cancel</a>
            <button type="submit" [disabled]="form.invalid || submitting" class="btn btn-primary flex items-center gap-2">
              @if (submitting) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              } @else {
                <span class="material-symbols-outlined text-[20px]">save</span>
                {{ isEdit ? 'Update Receipt' : 'Save Receipt' }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class VoucherForm implements OnInit {
  private fb = inject(FormBuilder);
  private voucherService = inject(VoucherService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  form: FormGroup;
  isEdit = false;
  voucherId = '';
  submitting = false;
  customers: any[] = [];

  constructor() {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      receiptDate: [getLocalDateString(), Validators.required],
      referenceNumber: [''],
      narration: ['']
    });
  }

  ngOnInit() {
    this.loadCustomers();
    
    this.voucherId = this.route.snapshot.paramMap.get('id') || '';
    if (this.voucherId) {
      this.isEdit = true;
      this.loadVoucher();
    }
  }

  loadCustomers() {
    this.customerService.getCustomers('', 1, 500).subscribe({
      next: (res) => {
        this.customers = res.items || [];
      }
    });
  }

  loadVoucher() {
    this.voucherService.getVoucher(this.voucherId).subscribe({
      next: (v) => {
        this.form.patchValue({
          customerId: v.customerId,
          amount: v.amount,
          receiptDate: v.receiptDate.split('T')[0],
          referenceNumber: v.referenceNumber,
          narration: v.narration
        });
      },
      error: () => {
        alert('Receipt not found');
        this.router.navigate(['/accounts/vouchers']);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const payload = this.form.value;

    if (this.isEdit) {
      this.voucherService.updateVoucher(this.voucherId, payload).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/accounts/vouchers']);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          alert('Failed to update receipt. See console for details.');
        }
      });
    } else {
      this.voucherService.createVoucher(payload).subscribe({
        next: (res: any) => {
          this.submitting = false;
          alert(`Receipt created successfully!\nReceipt No: ${res.voucherNumber || 'Generated'}`);
          this.router.navigate(['/accounts/vouchers', res.voucherId]);
        },
        error: (err) => {
          this.submitting = false;
          console.error(err);
          alert('Failed to create receipt. See console for details.');
        }
      });
    }
  }
}
