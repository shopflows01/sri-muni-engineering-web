import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DeliveryChallanService, CreateDeliveryChallanRequest } from '../../../core/services/delivery-challan.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { Customer, Product } from '../../../shared/models/api.models';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-delivery-challan-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="space-y-6 max-w-5xl mx-auto">
      <div class="flex items-center gap-4 pb-4 border-b border-gray-200">
        <button type="button" (click)="location.back()" 
          class="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <span class="material-symbols-outlined text-gray-600">arrow_back</span>
        </button>
        <div>
          <h1 class="text-2xl font-bold text-brand">{{ isEditMode ? 'Edit' : 'Create' }} Delivery Challan</h1>
          <p class="text-gray-500 text-sm mt-1">
            {{ isEditMode ? 'Update existing delivery challan' : 'Generate a new monthly delivery challan' }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <!-- Document Details -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Customer <span class="text-red-500">*</span></label>
            <select formControlName="customerId" 
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
              <option value="">Select Customer</option>
              @for (customer of customers; track customer.id) {
                <option [value]="customer.id">{{ customer.name }}</option>
              }
            </select>
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">DC Date <span class="text-red-500">*</span></label>
            <input type="date" formControlName="dcDate" 
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
          
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">PO No (Optional)</label>
            <input type="text" formControlName="poNo" placeholder="Enter PO Number"
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Your DC No (Optional)</label>
            <input type="text" formControlName="yourDcNo" placeholder="Enter Your DC Number"
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Your DC Date (Optional)</label>
            <input type="date" formControlName="yourDcDate" 
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>

          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Remarks</label>
            <input type="text" formControlName="remarks" placeholder="Any remarks"
              class="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:bg-white outline-none transition-all">
          </div>
        </div>

        <div class="pt-6 border-t border-gray-200">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900">Items</h3>
            <button type="button" (click)="addItem()" 
              class="text-brand hover:text-brand-light font-medium text-sm flex items-center gap-1 bg-brand/5 px-3 py-1.5 rounded-lg transition-colors">
              <span class="material-symbols-outlined text-sm">add</span>
              Add Item
            </button>
          </div>

          <div formArrayName="items" class="space-y-3">
            @for (item of items.controls; track i; let i = $index) {
              <div [formGroupName]="i" class="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 relative group">
                
                <div class="flex-1 space-y-2">
                  <label class="text-xs font-medium text-gray-600">Product</label>
                  <select formControlName="productId" 
                    class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                    <option value="">Select Product</option>
                    @for (product of products; track product.id) {
                      <option [value]="product.id">{{ product.partName }} ({{ product.partNo }})</option>
                    }
                  </select>
                </div>

                <div class="w-32 space-y-2">
                  <label class="text-xs font-medium text-gray-600">Quantity</label>
                  <input type="number" formControlName="quantity" min="1"
                    class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                </div>

                <div class="w-24 space-y-2">
                  <label class="text-xs font-medium text-gray-600">Unit</label>
                  <select formControlName="unit"
                    class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                    <option value="">Default</option>
                    <option value="Nos">Nos</option>
                    <option value="Kgs">Kgs</option>
                    <option value="Set">Set</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Mtrs">Mtrs</option>
                    <option value="Ltrs">Ltrs</option>
                  </select>
                </div>

                <div class="flex-1 space-y-2">
                  <label class="text-xs font-medium text-gray-600">Remarks (Optional)</label>
                  <input type="text" formControlName="remarks"
                    class="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand outline-none text-sm">
                </div>

                <button type="button" (click)="removeItem(i)" [disabled]="items.length === 1"
                  class="mt-7 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50">
                  <span class="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <button type="button" (click)="location.back()" 
            class="px-5 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors">
            Cancel
          </button>
          <button type="submit" [disabled]="form.invalid || isSubmitting"
            class="px-6 py-2 bg-brand hover:bg-brand-light text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2">
            @if (isSubmitting) {
              <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            } @else {
              {{ isEditMode ? 'Update' : 'Save' }}
            }
          </button>
        </div>
      </form>
    </div>
  `
})
export class DeliveryChallanForm implements OnInit {
  private fb = inject(FormBuilder);
  private dcService = inject(DeliveryChallanService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public location = inject(Location);

  form!: FormGroup;
  isEditMode = false;
  dcId: string | null = null;
  isSubmitting = false;

  customers: Customer[] = [];
  products: Product[] = [];

  ngOnInit() {
    this.initForm();

    forkJoin({
      customers: this.customerService.getCustomers('', 1, 1000),
      products: this.productService.getProducts('', 1, 1000)
    }).subscribe(res => {
      this.customers = res.customers.items;
      this.products = res.products.items;

      this.route.paramMap.subscribe(params => {
        this.dcId = params.get('id');
        if (this.dcId) {
          this.isEditMode = true;
          this.loadDC(this.dcId);
        }
      });
    });
  }

  initForm() {
    this.form = this.fb.group({
      customerId: ['', Validators.required],
      dcDate: [new Date().toISOString().substring(0, 10), Validators.required],
      yourDcNo: [''],
      yourDcDate: [''],
      poNo: [''],
      remarks: [''],
      items: this.fb.array([this.createItemFormGroup()])
    });
  }

  get items() {
    return this.form.get('items') as FormArray;
  }

  createItemFormGroup() {
    const group = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unit: [''],
      remarks: ['']
    });

    group.get('productId')?.valueChanges.subscribe(productId => {
      if (productId) {
        const product = this.products.find(p => p.id === productId);
        if (product && product.unit) {
          group.get('unit')?.setValue(product.unit, { emitEvent: false });
        }
      }
    });

    return group;
  }

  addItem() {
    this.items.push(this.createItemFormGroup());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  loadLookups() {
    this.customerService.getCustomers('', 1, 1000).subscribe(res => this.customers = res.items);
    this.productService.getProducts('', 1, 1000).subscribe(res => this.products = res.items);
  }

  loadDC(id: string) {
    this.dcService.getById(id).subscribe({
      next: (dc) => {
        this.form.patchValue({
          customerId: dc.customerId,
          dcDate: dc.dcDate ? new Date(dc.dcDate).toISOString().substring(0, 10) : '',
          yourDcNo: dc.yourDcNo,
          yourDcDate: dc.yourDcDate ? new Date(dc.yourDcDate).toISOString().substring(0, 10) : '',
          poNo: dc.poNo,
          remarks: dc.remarks
        });

        this.items.clear();
        dc.items.forEach(item => {
          const group = this.createItemFormGroup();
          group.patchValue({
            productId: item.productId,
            quantity: item.quantity,
            unit: item.unit || '',
            remarks: item.remarks
          }, { emitEvent: false });
          this.items.push(group);
        });
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;
    const request: CreateDeliveryChallanRequest = this.form.value;
    
    // Ensure dates are sent correctly or as null if empty
    if (!request.yourDcDate) {
      request.yourDcDate = undefined;
    }

    const req$ = this.isEditMode 
      ? this.dcService.update(this.dcId!, request)
      : this.dcService.create(request);

    req$.subscribe({
      next: () => {
        this.router.navigate(['/delivery-challans']);
      },
      error: (err) => {
        console.error('Error saving DC', err);
        this.isSubmitting = false;
        alert('Failed to save Delivery Challan');
      }
    });
  }
}
