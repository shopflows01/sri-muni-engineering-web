import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { getLocalDateString } from '../../../shared/utils/date-utils';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { StockService } from '../../../core/services/stock';
import { Customer, Product, StockLedger } from '../../../shared/models/api.models';
import { uppercaseStrings } from '../../../shared/utils/string-utils';
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
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private stockService = inject(StockService);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);
  stockItems = signal<StockLedger[]>([]);
  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  
  isEditMode = signal(false);
  invoiceId: string | null = null;

  // Default home state code (e.g. Tamil Nadu)
  readonly HOME_STATE_CODE = '33';

  invoiceForm = this.fb.group({
    invoiceNo: [{ value: '', disabled: true }, Validators.required],
    date: [getLocalDateString(), Validators.required],
    customerId: ['', Validators.required],
    remarks: [''],
    dcLedgerId: [''],
    deliveryNoteNo: [''],
    dcDate: [''],
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
    
    this.invoiceId = this.route.snapshot.paramMap.get('id');
    if (this.invoiceId && this.invoiceId !== 'new') {
      this.isEditMode.set(true);
      this.loadInvoice(this.invoiceId);
    } else {
      this.fetchNextInvoiceNumber();
      if (this.items.length === 0) {
        this.addItem();
      }
    }

    this.subs.add(
      this.invoiceForm.get('dcLedgerId')?.valueChanges.subscribe(val => {
        if (val) {
          const stock = this.stockItems().find(s => s.id === val);
          if (stock) {
            this.invoiceForm.patchValue({
              deliveryNoteNo: stock.dcNo,
              dcDate: stock.dcDate ? stock.dcDate.substring(0, 10) : ''
            });
          }
        }
      })
    );
  }

  loadInvoice(id: string) {
    this.invoiceService.getById(id).subscribe({
      next: (invoice) => {
        this.invoiceForm.patchValue({
          invoiceNo: invoice.invoiceNo,
          date: invoice.date ? invoice.date.substring(0, 10) : getLocalDateString(),
          customerId: invoice.customerId,
          remarks: invoice.remarks,
          dcLedgerId: invoice.dcLedgerId,
          deliveryNoteNo: invoice.deliveryNoteNo,
          dcDate: invoice.dcDate ? invoice.dcDate.substring(0, 10) : '',
          referenceNo: invoice.referenceNo,
          buyersOrderNo: invoice.buyersOrderNo,
          dispatchDocNo: invoice.dispatchDocNo,
          destination: invoice.destination,
          termsOfDelivery: invoice.termsOfDelivery,
          asnNo: invoice.asnNo,
          ewbNo: invoice.ewbNo
        });

        this.items.clear();
        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach(item => {
            const itemGroup = this.createItem();
            const isOthers = !item.productId;
            itemGroup.patchValue({
              productId: isOthers ? 'others' : item.productId,
              customProductName: isOthers ? item.productName || item.productPartNo : '',
              hsnCode: item.hsnCode || '',
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              gstPercent: item.gstPercent
            });
            this.items.push(itemGroup);
          });
        } else {
          this.addItem();
        }
      },
      error: (err) => console.error('Error loading invoice', err)
    });
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
      customProductName: [''],
      hsnCode: [''],
      description: [''],
      quantity: [0, [Validators.required, Validators.min(1)]],
      rate: [0, [Validators.required, Validators.min(0.01)]],
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

  onProductChange(index: number) {
    const itemGroup = this.items.at(index);
    const productId = itemGroup.get('productId')?.value;
    if (productId && productId !== 'others') {
      const prod = this.products().find(p => p.id === productId);
      if (prod) {
        itemGroup.patchValue({ 
          hsnCode: prod.hsnSac || '',
          rate: prod.ratePerItem || 0,
          gstPercent: prod.gstPercent || 18
        });
      }
    } else {
      itemGroup.patchValue({ hsnCode: '', rate: 0, gstPercent: 18 });
    }
  }

  // Auto tax calculations based on customer state code
  isInterState(): boolean {
    const customerId = this.invoiceForm.get('customerId')?.value;
    if (!customerId) return false;
    const cust = this.customers().find(c => c.id === customerId);
    if (!cust || !cust.stateCode) return false;
    return String(cust.stateCode).trim() !== String(this.HOME_STATE_CODE).trim();
  }

  getItemAmount(index: number): number {
    const item = this.items.at(index).value;
    return (item.quantity || 0) * (item.rate || 0);
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
      
      let payload = {
        customerId: val.customerId,
        invoiceDate: val.date!,
        remarks: val.remarks || '',
        dcLedgerId: val.dcLedgerId || null,
        deliveryNoteNo: val.deliveryNoteNo || '',
        dcDate: val.dcDate || null,
        referenceNo: val.referenceNo || '',
        buyersOrderNo: val.buyersOrderNo || '',
        dispatchDocNo: val.dispatchDocNo || '',
        destination: val.destination || '',
        termsOfDelivery: val.termsOfDelivery || '',
        asnNo: val.asnNo || '',
        ewbNo: val.ewbNo || '',
        items: val.items?.map((item: any) => ({
          productId: item.productId === 'others' ? null : item.productId,
          productName: item.productId === 'others' ? item.customProductName : undefined,
          hsnCode: item.hsnCode || '',
          description: item.description || '',
          quantity: Number(item.quantity),
          rate: Number(item.rate),
          gstPercent: Number(item.gstPercent)
        }))
      };

      // Apply uppercase to all string fields
      payload = uppercaseStrings(payload);

      const req = this.isEditMode() && this.invoiceId 
        ? this.invoiceService.update(this.invoiceId, payload as any)
        : this.invoiceService.create(payload as any);

      req.subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/invoices']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err?.error?.message || 'Failed to save invoice. Please check your inputs.');
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
