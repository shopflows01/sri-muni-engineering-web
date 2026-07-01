import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css'
})
export class ProductForm implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);
  productId: string | null = null;

  productForm = this.fb.group({
    customerId: ['', Validators.required],
    partNo: ['', Validators.required],
    partName: ['', Validators.required],
    hsnSac: [''],
    unit: ['NOS']
  });

  ngOnInit() {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (this.productId && this.productId !== 'new') {
      this.isEditMode.set(true);
      this.productService.getProduct(this.productId).subscribe(p => this.productForm.patchValue(p as any));
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isSaving.set(true);
      const data = this.productForm.getRawValue() as any;
      const req = this.isEditMode() && this.productId ? this.productService.updateProduct(this.productId, data) : this.productService.createProduct(data);
      req.subscribe({ next: () => this.router.navigate(['/products']), error: () => this.isSaving.set(false) });
    }
  }
}
