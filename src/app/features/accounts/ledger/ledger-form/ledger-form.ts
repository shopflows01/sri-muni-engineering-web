import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CustomerLedgerService } from '../../../../core/services/customer-ledger.service';
import { CustomerService } from '../../../../core/services/customer';
import { Customer } from '../../../../shared/models/api.models';

@Component({
  selector: 'app-ledger-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="max-w-2xl mx-auto pt-6 animate-fade-in">
      <div class="flex items-center gap-3 mb-6">
        <a routerLink="/accounts/ledgers" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <span class="material-symbols-outlined text-[20px]">arrow_back</span>
        </a>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Create Customer Ledger</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 class="text-lg font-medium text-gray-900">Ledger Details</h2>
          <p class="text-sm text-gray-500 mt-1">Set the initial opening balance for a customer.</p>
        </div>
        
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="p-6 space-y-6">
          <div class="space-y-4">
            <div>
              <label for="customerId" class="block text-sm font-medium text-gray-700 mb-1">Customer <span class="text-red-500">*</span></label>
              <select id="customerId" formControlName="customerId" 
                      class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                <option value="">Select a customer...</option>
                @for (customer of customers; track customer.id) {
                  <option [value]="customer.id">{{ customer.name }}</option>
                }
              </select>
              @if (form.get('customerId')?.invalid && form.get('customerId')?.touched) {
                <p class="text-xs text-red-500 mt-1">Customer is required</p>
              }
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label for="balanceType" class="block text-sm font-medium text-gray-700 mb-1">Balance Type <span class="text-red-500">*</span></label>
                <select id="balanceType" formControlName="balanceType" 
                        class="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                  <option value="Debit">Debit (Dr)</option>
                  <option value="Credit">Credit (Cr)</option>
                </select>
              </div>

              <div>
                <label for="openingBalance" class="block text-sm font-medium text-gray-700 mb-1">Opening Balance <span class="text-red-500">*</span></label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                  <input type="number" id="openingBalance" formControlName="openingBalance" min="0" step="0.01"
                         class="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all text-sm">
                </div>
                @if (form.get('openingBalance')?.invalid && form.get('openingBalance')?.touched) {
                  <p class="text-xs text-red-500 mt-1">Valid opening balance is required</p>
                }
              </div>
            </div>
          </div>

          <div class="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <a routerLink="/accounts/ledgers" class="btn btn-outline flex items-center gap-2 text-gray-600 border-gray-300 hover:bg-gray-50">Cancel</a>
            <button type="submit" [disabled]="form.invalid || submitting" 
                    class="btn btn-primary flex items-center gap-2">
              @if (submitting) {
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              } @else {
                <span class="material-symbols-outlined text-[20px]">save</span>
                Save Ledger
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LedgerForm implements OnInit {
  private fb = inject(FormBuilder);
  private ledgerService = inject(CustomerLedgerService);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  form: FormGroup;
  customers: Customer[] = [];
  submitting = false;

  constructor() {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      balanceType: ['Debit', Validators.required],
      openingBalance: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    // In a real app, this should probably use search/pagination if there are many customers
    // Using page size 100 for now to get a list
    this.customerService.getCustomers('', 1, 100).subscribe({
      next: (res) => {
        this.customers = res.items || [];
      },
      error: (err) => console.error('Error loading customers', err)
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.submitting = true;
    const formData = this.form.value;

    this.ledgerService.createLedger({
      customerId: formData.customerId,
      balanceType: formData.balanceType,
      openingBalance: Number(formData.openingBalance)
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/accounts/ledgers']);
      },
      error: (err) => {
        console.error('Error creating ledger', err);
        this.submitting = false;
        alert(err.error?.message || 'Failed to create ledger');
      }
    });
  }
}

