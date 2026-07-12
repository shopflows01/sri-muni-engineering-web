import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { StockService } from '../../../core/services/stock';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { Customer, Product } from '../../../shared/models/api.models';
import { uppercaseStrings } from '../../../shared/utils/string-utils';

@Component({
  selector: 'app-stock-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl: './stock-form.html',
})
export class StockForm implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private stockService = inject(StockService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);

  isEditMode = signal(false);
  dcId = signal<string | null>(null);
  isLoading = signal(false);
  isSubmitting = signal(false);
  
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  
  successMessage = signal<string | null>(null);

  form = this.fb.group({
    dcNo: ['', Validators.required],
    dcDate: ['', Validators.required],
    customerId: ['', Validators.required],
    remarks: [''],
    items: this.fb.array([])
  });

  // Rejection handling state per item
  rejectingItemId = signal<string | null>(null);
  rejectQty = signal<number>(0);

  get itemsFormArray() {
    return this.form.get('items') as FormArray;
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.dcId.set(id);
      this.loadDC(id);
    } else {
      this.addItem(); // add one empty item by default
    }
  }

  loadCustomers() {
    this.customerService.getCustomers('', 1, 100).subscribe({
      next: (res) => this.customers.set(res.items)
    });
  }

  loadProducts() {
    this.productService.getProducts('', 1, 100).subscribe({
      next: (res) => this.products.set(res.items)
    });
  }

  loadDC(id: string) {
    this.isLoading.set(true);
    this.stockService.getById(id).subscribe({
      next: (dc) => {
        this.form.patchValue({
          dcNo: dc.dcNo,
          dcDate: dc.dcDate.split('T')[0],
          customerId: dc.customerId,
          remarks: dc.remarks || ''
        });

        dc.items.forEach(item => {
          this.itemsFormArray.push(this.fb.group({
            id: [item.id],
            productId: [item.productId, Validators.required],
            qtySent: [item.qtySent, [Validators.required, Validators.min(1)]],
            rate: [item.rate || 0, [Validators.min(0)]],
            gstPercent: [item.gstPercent || 18, [Validators.min(0)]],
            remarks: [item.remarks || '']
          }));
        });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.router.navigate(['/stock']);
      }
    });
  }

  createItemFormGroup() {
    return this.fb.group({
      id: [null],
      productId: ['', Validators.required],
      qtySent: [0, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.min(0)]],
      gstPercent: [18, [Validators.min(0)]],
      remarks: ['']
    });
  }

  addItem() {
    this.itemsFormArray.push(this.createItemFormGroup());
  }

  removeItem(index: number) {
    if (this.itemsFormArray.length > 1) {
      this.itemsFormArray.removeAt(index);
    }
  }

  submit() {
    if (this.form.valid) {
      this.isSubmitting.set(true);
      let payload = this.form.getRawValue() as any;
      payload = uppercaseStrings(payload);

      const req = this.isEditMode()
        ? this.stockService.updateDC(this.dcId()!, payload)
        : this.stockService.createDC(payload);

      req.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/stock']);
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  // --- Rejection API Handling ---
  openReject(dcItemId: string) {
    this.rejectingItemId.set(dcItemId);
    this.rejectQty.set(0);
  }

  cancelReject() {
    this.rejectingItemId.set(null);
  }

  submitReject(dcItemId: string) {
    if (this.rejectQty() <= 0) return;
    
    this.stockService.addTransaction(dcItemId, {
      transactionType: 3, // Rejected
      transactionDate: new Date().toISOString().split('T')[0],
      quantity: this.rejectQty()
    }).subscribe({
      next: () => {
        this.showSuccess('Rejected quantity updated successfully.');
        this.rejectingItemId.set(null);
        // Reload to update quantities visually if needed, though form doesn't strictly show rej qty in inputs
        // A reload is a good idea to ensure sync
        if (this.dcId()) {
          this.itemsFormArray.clear();
          this.loadDC(this.dcId()!);
        }
      },
      error: () => alert('Failed to update rejection')
    });
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
