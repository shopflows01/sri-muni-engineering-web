import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { StockService } from '../../../core/services/stock';
import { Customer, Product, StockLedger } from '../../../shared/models/api.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-invoice-form',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './invoice-form.html',
  styleUrl: './invoice-form.css',
})
export class InvoiceForm implements OnInit, OnDestroy {
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

  // Default home state code (e.g. Tamil Nadu)
  readonly HOME_STATE_CODE = '33';

  invoiceForm = this.fb.group({
    invoiceNo: [{ value: '', disabled: true }, Validators.required],
    date: [new Date().toISOString().substring(0, 10), Validators.required],
    customerId: ['', Validators.required],
    remarks: [''],
    dcLedgerId: [''],
    deliveryNoteNo: [''],
    referenceNo: [''],
    buyersOrderNo: [''],
    dispatchDocNo: [''],
    destination: [''],
    termsOfDelivery: [''],
    asnNo: [''],
    ewbNo: [''],
    items: this.fb.array([])
  });

  private subs = new Subscription();

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();
    this.loadStockItems();
    this.fetchNextInvoiceNumber();

    // Start with one item
    if (this.items.length === 0) {
      this.addItem();
    }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  get items() {
    return this.invoiceForm.get('items') as FormArray;
  }

  createItem() {
    return this.fb.group({
      productId: ['', Validators.required],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0.01)]],
      discount: [0, [Validators.min(0)]],
      gstPercent: [18, [Validators.required, Validators.min(0)]]
    });
  }

  addItem() {
    this.items.push(this.createItem());
  }

  removeItem(index: number) {
    if (this.items.length > 1) {
      this.items.removeAt(index);
    }
  }

  fetchNextInvoiceNumber() {
    this.invoiceService.getNextInvoiceNumber().subscribe({
      next: (res) => {
        this.invoiceForm.patchValue({ invoiceNo: res.invoiceNo });
      },
      error: (err) => console.error('Error fetching next invoice number:', err)
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

  loadStockItems() {
    this.stockService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => this.stockItems.set(res.items)
    });
  }

  // Auto tax calculations based on customer state code
  isInterState(): boolean {
    const customerId = this.invoiceForm.get('customerId')?.value;
    if (!customerId) return false;
    const cust = this.customers().find(c => c.id === customerId);
    if (!cust) return false;
    return cust.stateCode !== this.HOME_STATE_CODE;
  }

  getItemAmount(index: number): number {
    const item = this.items.at(index).value;
    return (item.quantity || 0) * (item.rate || 0) - (item.discount || 0);
  }

  getItemTaxAmount(index: number): number {
    const amount = this.getItemAmount(index);
    const gstPercent = this.items.at(index).value.gstPercent || 0;
    return amount * (gstPercent / 100);
  }

  getSubTotal(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getItemAmount(i), 0);
  }

  getTotalTax(): number {
    return this.items.controls.reduce((sum, _, i) => sum + this.getItemTaxAmount(i), 0);
  }

  getGrandTotal(): number {
    return this.getSubTotal() + this.getTotalTax();
  }

  submit() {
    if (this.invoiceForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      const val = this.invoiceForm.getRawValue();
      
      const payload = {
        customerId: val.customerId,
        invoiceDate: new Date(val.date!).toISOString(),
        remarks: val.remarks || '',
        dcLedgerId: val.dcLedgerId,
        deliveryNoteNo: val.deliveryNoteNo || '',
        referenceNo: val.referenceNo || '',
        buyersOrderNo: val.buyersOrderNo || '',
        dispatchDocNo: val.dispatchDocNo || '',
        destination: val.destination || '',
        termsOfDelivery: val.termsOfDelivery || '',
        asnNo: val.asnNo || '',
        ewbNo: val.ewbNo || '',
        items: val.items?.map((item: any) => ({
          productId: item.productId,
          description: item.description || '',
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          discount: Number(item.discount),
          gstPercent: Number(item.gstPercent)
        }))
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
