import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { getLocalDateString } from '../../../shared/utils/date-utils';
import { FormBuilder, FormArray, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { StockService } from '../../../core/services/stock';
import { Customer, Product, JobWorkDC, JobWorkDCItem } from '../../../shared/models/api.models';
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
  stockItems = signal<JobWorkDC[]>([]);
  selectedDc = signal<JobWorkDC | null>(null);

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  isEditMode = signal(false);
  invoiceId: string | null = null;

  // Track initial quantities for edit mode so we don't count them against the limit
  initialQuantities = new Map<string, number>();

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
            this.selectedDc.set(stock);
            this.invoiceForm.patchValue({
              deliveryNoteNo: stock.dcNo,
              dcDate: stock.dcDate ? stock.dcDate.substring(0, 10) : ''
            });
            // Revalidate existing items
            this.items.controls.forEach(control => {
              control.get('quantity')?.updateValueAndValidity();
              control.get('productId')?.updateValueAndValidity();
            });
          }
        } else {
          this.selectedDc.set(null);
        }
      })
    );

    // Subscribe to item value changes to re-evaluate duplicate selections
    this.subs.add(
      this.items.valueChanges.subscribe(() => {
        // Trigger a fake re-evaluation of product dropdowns if necessary
        // or just let the template call the signal
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

        this.tryMatchDcLedger();

        this.items.clear();
        this.initialQuantities.clear();

        if (invoice.items && invoice.items.length > 0) {
          invoice.items.forEach(item => {
            if (item.productId) {
              this.initialQuantities.set(item.productId, item.quantity);
            }
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
      description: ['Machining'],
      quantity: [0, [Validators.required, Validators.min(1), this.quantityValidator.bind(this)]],
      rate: [0, [Validators.required, Validators.min(0.01)]],
      gstPercent: [18, [Validators.required, Validators.min(0)]]
    });
  }

  // Custom Validator for Quantity
  quantityValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.parent) return null;
    const productId = control.parent.get('productId')?.value;
    const dc = this.selectedDc();

    if (dc && productId && productId !== 'others') {
      const dcItem = dc.items?.find(i => i.productId === productId);
      if (dcItem) {
        const qty = Number(control.value) || 0;
        let pending = (dcItem.inwardQty || 0) - (dcItem.outwardQty || 0) - (dcItem.rejectedQty || 0);

        // Add back the quantity this invoice already consumed (in edit mode)
        if (this.isEditMode() && this.initialQuantities.has(productId)) {
          pending += this.initialQuantities.get(productId) || 0;
        }

        // Subtract quantities of the same product used in other rows (though we prevent duplicates, it's good safety)
        const otherRowsQty = this.items.controls
          .filter(c => c !== control.parent && c.get('productId')?.value === productId)
          .reduce((sum, c) => sum + (Number(c.get('quantity')?.value) || 0), 0);

        const available = pending - otherRowsQty;

        if (qty > available) {
          return { exceededDcLimit: { max: available, actual: qty } };
        }
      }
    }
    return null;
  }

  // Returns available products for a specific dropdown, filtering out already selected ones
  getAvailableProducts(currentIndex: number): Product[] {
    const dc = this.selectedDc();

    // Enforce cascading: No DC selected = no products available
    if (!dc) return [];

    const allProducts = this.products();

    // Filter to only products in the DC
    let available = allProducts;
    if (dc.items) {
      const dcProductIds = new Set(dc.items.map(i => i.productId));
      available = allProducts.filter(p => dcProductIds.has(p.id));
    }

    // Filter out products already selected in other rows
    const selectedIds = new Set<string>();
    for (let i = 0; i < this.items.length; i++) {
      if (i !== currentIndex) {
        const val = this.items.at(i).get('productId')?.value;
        if (val && val !== 'others') {
          selectedIds.add(val);
        }
      }
    }

    return available.filter(p => !selectedIds.has(p.id));
  }

  getDcPendingQty(productId: string): number | null {
    const dc = this.selectedDc();
    if (!dc || !dc.items || !productId || productId === 'others') return null;

    const item = dc.items.find(i => i.productId === productId);
    if (!item) return null;

    let pending = (item.inwardQty || 0) - (item.outwardQty || 0) - (item.rejectedQty || 0);
    if (this.isEditMode() && this.initialQuantities.has(productId)) {
      pending += this.initialQuantities.get(productId) || 0;
    }
    return pending;
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
      next: (res) => {
        this.stockItems.set(res.items);
        this.tryMatchDcLedger();
      }
    });
  }

  tryMatchDcLedger() {
    if (this.isEditMode() && this.stockItems().length > 0) {
      const deliveryNoteNo = this.invoiceForm.get('deliveryNoteNo')?.value;
      if (deliveryNoteNo && !this.invoiceForm.get('dcLedgerId')?.value) {
        const dc = this.stockItems().find(s => s.dcNo === deliveryNoteNo);
        if (dc) {
          this.invoiceForm.patchValue({ dcLedgerId: dc.id });
        }
      }
    }
  }

  onProductChange(index: number) {
    const itemGroup = this.items.at(index);
    const productId = itemGroup.get('productId')?.value;
    if (productId && productId !== 'others') {
      const prod = this.products().find(p => p.id === productId);
      const dcItem = this.selectedDc()?.items?.find(i => i.productId === productId);
      if (prod) {
        itemGroup.patchValue({ 
          hsnCode: prod.hsnSac || '',
          rate: dcItem?.rate || prod.ratePerItem || 0,
          gstPercent: dcItem?.gstPercent || prod.gstPercent || 18
        });
      }
    } else {
      itemGroup.patchValue({ hsnCode: '', rate: 0, gstPercent: 18 });
    }
    itemGroup.get('quantity')?.updateValueAndValidity();
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

