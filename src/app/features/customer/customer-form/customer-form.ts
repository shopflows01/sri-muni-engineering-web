import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/services/customer';

@Component({
  selector: 'app-customer-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './customer-form.html',
  styleUrl: './customer-form.css'
})
export class CustomerForm implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEditMode = signal(false);
  isSaving = signal(false);
  customerId: string | null = null;

  customerForm = this.fb.group({
    name: ['', Validators.required],
    vendorCode: [''],
    gstin: [''],
    stateName: [''],
    stateCode: [''],
    billingAddress: [''],
    shippingAddress: [''],
    pincode: ['']
  });

  ngOnInit() {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId && this.customerId !== 'new') {
      this.isEditMode.set(true);
      this.loadCustomer(this.customerId);
    }
  }

  loadCustomer(id: string) {
    this.customerService.getCustomer(id).subscribe(customer => {
      this.customerForm.patchValue(customer as any);
    });
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.isSaving.set(true);
      const data = this.customerForm.getRawValue() as any;
      
      const req = this.isEditMode() && this.customerId 
        ? this.customerService.updateCustomer(this.customerId, data)
        : this.customerService.createCustomer(data);

      req.subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/customers']);
        },
        error: () => {
          this.isSaving.set(false);
        }
      });
    } else {
      this.customerForm.markAllAsTouched();
    }
  }
}
