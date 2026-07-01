import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { QuotationService } from '../../../core/services/quotation.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { Quotation, Customer, Product } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-quotation-view',
  imports: [ReactiveFormsModule, DatePipe, DecimalPipe, EmptyState],
  templateUrl: './quotation-view.html',
  styleUrl: './quotation-view.css',
})
export class QuotationView implements OnInit {
  private quotationService = inject(QuotationService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  quotations = signal<Quotation[]>([]);
  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(false);
  showForm = signal(false);
  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  quotationForm = this.fb.group({
    quotationNo: ['', Validators.required],
    date: ['', Validators.required],
    customerId: ['', Validators.required],
    productId: ['', Validators.required],
    model: ['', Validators.required],
    numberOff: [1, [Validators.required, Validators.min(1)]],
    operations: this.fb.array([]),
    toolsCost: [0],
    inspectionCost: [0],
    oilingPackingCost: [0],
    othersCost: [0],
    estimatedCostPerPart: [0, Validators.required],
    gstRate: [18, Validators.required]
  });

  get operationsArray(): FormArray {
    return this.quotationForm.get('operations') as FormArray;
  }

  ngOnInit() {
    this.loadQuotations();
    this.loadCustomers();
    this.loadProducts();
  }

  loadQuotations() {
    this.isLoading.set(true);
    this.quotationService.getAll({ page: 1, pageSize: 50 }).subscribe({
      next: (res) => {
        this.quotations.set(res.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
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

  addOperation() {
    this.operationsArray.push(this.fb.group({
      opnNo: [this.operationsArray.length + 1],
      sequenceOfOperation: ['', Validators.required],
      machine: [''],
      outputPerHour: [0],
      machineHourRate: [0],
      costPerPart: [0]
    }));
  }

  removeOperation(index: number) {
    this.operationsArray.removeAt(index);
  }

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.quotationForm.reset({ numberOff: 1, gstRate: 18 });
      this.operationsArray.clear();
    }
  }

  submitQuotation() {
    if (this.quotationForm.valid) {
      this.isSubmitting.set(true);
      const val = this.quotationForm.getRawValue();
      const payload = {
        quotationNo: val.quotationNo,
        date: new Date(val.date!).toISOString(),
        customerId: val.customerId,
        productId: val.productId,
        model: val.model,
        numberOff: val.numberOff,
        operations: val.operations,
        otherCosts: {
          toolsCost: val.toolsCost,
          inspectionCost: val.inspectionCost,
          oilingPackingCost: val.oilingPackingCost,
          othersCost: val.othersCost
        },
        estimatedCostPerPart: val.estimatedCostPerPart,
        gstRate: val.gstRate
      };
      this.quotationService.create(payload as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.showSuccess('Quotation created successfully.');
          this.toggleForm();
          this.loadQuotations();
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.quotationForm.markAllAsTouched();
    }
  }

  downloadPdf(quotation: Quotation) {
    this.quotationService.getPdf(quotation.id).subscribe({
      next: (res) => {
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
        }
      }
    });
  }

  previewPdf(quotation: Quotation) {
    this.quotationService.getPdf(quotation.id).subscribe({
      next: (res) => {
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
        }
      }
    });
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
