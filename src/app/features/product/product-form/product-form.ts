import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';
import { CustomerService } from '../../../core/services/customer';
import { Customer } from '../../../shared/models/api.models';

import { uppercaseStrings } from '../../../shared/utils/string-utils';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);
  productId: string | null = null;
  customers = signal<Customer[]>([]);

  productForm = this.fb.group({
    customerId: ['', Validators.required],
    partNo: ['', Validators.required],
    partName: ['', Validators.required],
    hsnSac: [''],
    unit: ['NOS'],
    ratePerItem: [0, [Validators.required, Validators.min(0)]],
    gstPercent: [18, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  ngOnInit() {
    this.loadCustomers();
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId && this.productId !== 'new') {
      this.isEditMode.set(true);
      this.productService.getProduct(this.productId).subscribe(p => {
        const data = p as any;
        if (!data.customerId && data.customers?.length > 0) {
          data.customerId = data.customers[0].customerId;
        }
        this.productForm.patchValue(data);
      });
    }
  }

  loadCustomers() {
    this.customerService.getCustomers('', 1, 100).subscribe({
      next: (res) => this.customers.set(res.items)
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSaving.set(true);
      let data = this.productForm.getRawValue() as any;
      data = uppercaseStrings(data);
      const req = this.isEditMode() && this.productId ? this.productService.updateProduct(this.productId, data) : this.productService.createProduct(data);
      req.subscribe({ next: () => this.router.navigate(['/products']), error: () => this.isSaving.set(false) });
    }
  }
}
