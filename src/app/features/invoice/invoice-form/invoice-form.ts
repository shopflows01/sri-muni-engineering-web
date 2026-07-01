import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { StockService } from '../../../core/services/stock';
import { Customer, Product, StockLedger } from '../../../shared/models/api.models';

@Component({
  selector: 'app-invoice-form',
  imports: [ReactiveFormsModule],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
})
export class InvoiceForm implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private stockService = inject(StockService);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  stockItems = signal<StockLedger[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  invoiceForm = this.fb.group({
    invoiceNo: ['', Validators.required],
    date: ['', Validators.required],
    dcLedgerId: ['', Validators.required],
    customerId: ['', Validators.required],
    productId: ['', Validators.required],
    quantity: [0, [Validators.required, Validators.min(1)]],
    rate: [0, [Validators.required, Validators.min(0.01)]],
    igstRate: [18, [Validators.required, Validators.min(0)]],
    asnNo: [''],
    ewbNo: ['']
  });

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
    this.loadStockItems();
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

  loadStockItems() {
    this.stockService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => this.stockItems.set(res.items)
    });
  }

  submit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      const val = this.invoiceForm.getRawValue();
      const payload = {
        invoiceNo: val.invoiceNo,
        date: new Date(val.date!).toISOString(),
        dcLedgerId: val.dcLedgerId,
        customerId: val.customerId,
        productId: val.productId,
        quantity: val.quantity,
        rate: val.rate,
        igstRate: val.igstRate,
        asnNo: val.asnNo || undefined,
        ewbNo: val.ewbNo || undefined
      };
      this.invoiceService.create(payload as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/invoices']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to create invoice. Please check your inputs.');
        }
      });
    } else {
      this.invoiceForm.markAllAsTouched();
    }
  }

  cancel() {
    this.router.navigate(['/invoices']);
  }
}
