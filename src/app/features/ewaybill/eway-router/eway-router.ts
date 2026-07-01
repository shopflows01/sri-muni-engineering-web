import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { Invoice, Customer, Product } from '../../../shared/models/api.models';
import { PaginatedResponse } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-eway-router',
  imports: [FormsModule, DecimalPipe],
  templateUrl: './eway-router.html',
  styleUrl: './eway-router.css',
})
export class EwayRouter implements OnInit {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);

  invoices = signal<Invoice[]>([]);
  customers = signal<Map<string, Customer>>(new Map());
  products = signal<Map<string, Product>>(new Map());
  isLoading = signal(false);
  showJsonPreview = signal(false);
  generatedJson = signal('');
  selectedInvoiceId = signal('');

  // E-Way Bill form fields
  userGstin = signal('');
  supplyType = signal('O');
  subSupplyType = signal(1);
  subSupplyDesc = signal('');
  docType = signal('INV');
  docNo = signal('');
  docDate = signal('');
  transType = signal(1);

  // From details
  fromGstin = signal('');
  fromTrdName = signal('SRI MUNI ENGINEERING');
  fromAddr1 = signal('');
  fromAddr2 = signal('');
  fromPlace = signal('');
  fromPincode = signal(0);
  fromStateCode = signal(0);
  actualFromStateCode = signal(0);

  // To details
  toGstin = signal('');
  toTrdName = signal('');
  toAddr1 = signal('');
  toAddr2 = signal('');
  toPlace = signal('');
  toPincode = signal(0);
  toStateCode = signal(0);
  actualToStateCode = signal(0);

  // Values
  totalValue = signal(0);
  cgstValue = signal(0);
  sgstValue = signal(0);
  igstValue = signal(0);
  cessValue = signal(0);
  totNonAdvolVal = signal(0);
  othValue = signal(0);
  totInvValue = signal(0);

  // Transport
  transMode = signal(1);
  transDistance = signal(0);
  transporterName = signal('');
  transporterId = signal('');
  transDocNo = signal('');
  transDocDate = signal('');
  vehicleNo = signal('');
  vehicleType = signal('R');

  // Item details
  mainHsnCode = signal('');
  itemProductName = signal('');
  itemProductDesc = signal('');
  itemHsnCode = signal('');
  itemQuantity = signal(0);
  itemQtyUnit = signal('NOS');
  itemTaxableAmount = signal(0);
  itemSgstRate = signal(0);
  itemCgstRate = signal(0);
  itemIgstRate = signal(0);
  itemCessRate = signal(0);
  itemCessNonAdvol = signal(0);

  ngOnInit() {
    this.loadInvoices();
    this.loadCustomers();
    this.loadProducts();

    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');
    if (invoiceId) {
      this.selectedInvoiceId.set(invoiceId);
      this.loadAndPopulateInvoice(invoiceId);
    }
  }

  loadInvoices() {
    this.invoiceService.getAll({ page: 1, pageSize: 100 }).subscribe({
      next: (res) => this.invoices.set(res.items)
    });
  }

  loadCustomers() {
    this.customerService.getCustomers('', 1, 100).subscribe({
      next: (res) => {
        const map = new Map<string, Customer>();
        res.items.forEach(c => map.set(c.id, c));
        this.customers.set(map);
      }
    });
  }

  loadProducts() {
    this.productService.getProducts('', 1, 100).subscribe({
      next: (res) => {
        const map = new Map<string, Product>();
        res.items.forEach(p => map.set(p.id, p));
        this.products.set(map);
      }
    });
  }

  onInvoiceSelected() {
    const id = this.selectedInvoiceId();
    if (id) {
      this.loadAndPopulateInvoice(id);
    }
  }

  private loadAndPopulateInvoice(id: string) {
    this.isLoading.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (inv) => {
        this.populateFromInvoice(inv);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private populateFromInvoice(inv: Invoice) {
    const customer = this.customers().get(inv.customerId);
    const product = this.products().get(inv.productId);

    // Document details
    this.docNo.set(inv.invoiceNo);
    this.docDate.set(new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }));

    // To details from customer
    if (customer) {
      this.toGstin.set(customer.gstin || '');
      this.toTrdName.set(customer.name || '');
      this.toAddr1.set(customer.shippingAddress || customer.billingAddress || '');
      this.toPincode.set(customer.pincode ? parseInt(customer.pincode) : 0);
      this.toStateCode.set(customer.stateCode ? parseInt(customer.stateCode) : 0);
      this.actualToStateCode.set(customer.stateCode ? parseInt(customer.stateCode) : 0);
    } else {
      this.toTrdName.set(inv.customerName || '');
    }

    // Values from invoice
    this.totalValue.set(inv.taxableValue || 0);
    this.cgstValue.set(inv.cgstAmount || 0);
    this.sgstValue.set(inv.sgstAmount || 0);
    this.igstValue.set(inv.igstAmount || 0);
    this.totInvValue.set(inv.totalAmount || 0);

    // Item details
    this.itemProductName.set(inv.partName || product?.partName || '');
    this.itemProductDesc.set(inv.partNo || product?.partNo || '');
    this.itemHsnCode.set(inv.hsnSac || product?.hsnSac || '');
    this.mainHsnCode.set(inv.hsnSac || product?.hsnSac || '');
    this.itemQuantity.set(inv.quantity || 0);
    this.itemQtyUnit.set(product?.unit || 'NOS');
    this.itemTaxableAmount.set(inv.taxableValue || 0);
    this.itemIgstRate.set(inv.igstRate || 0);
    this.itemCgstRate.set(inv.cgstRate || 0);
    this.itemSgstRate.set(inv.sgstRate || 0);
  }

  generateJson(): string {
    const ewayBillJson = {
      version: '1.0.1118',
      billLists: [{
        userGstin: this.userGstin(),
        supplyType: this.supplyType(),
        subSupplyType: this.subSupplyType(),
        subSupplyDesc: this.subSupplyDesc(),
        docType: this.docType(),
        docNo: this.docNo(),
        docDate: this.docDate(),
        transType: this.transType(),
        fromGstin: this.fromGstin(),
        fromTrdName: this.fromTrdName(),
        fromAddr1: this.fromAddr1(),
        fromAddr2: this.fromAddr2(),
        fromPlace: this.fromPlace(),
        fromPincode: this.fromPincode(),
        fromStateCode: this.fromStateCode(),
        actualFromStateCode: this.actualFromStateCode(),
        toGstin: this.toGstin(),
        toTrdName: this.toTrdName(),
        toAddr1: this.toAddr1(),
        toAddr2: this.toAddr2(),
        toPlace: this.toPlace(),
        toPincode: this.toPincode(),
        toStateCode: this.toStateCode(),
        actualToStateCode: this.actualToStateCode(),
        totalValue: this.totalValue(),
        cgstValue: this.cgstValue(),
        sgstValue: this.sgstValue(),
        igstValue: this.igstValue(),
        cessValue: this.cessValue(),
        TotNonAdvolVal: this.totNonAdvolVal(),
        OthValue: this.othValue(),
        totInvValue: this.totInvValue(),
        transMode: this.transMode(),
        transDistance: this.transDistance(),
        transporterName: this.transporterName(),
        transporterId: this.transporterId(),
        transDocNo: this.transDocNo(),
        transDocDate: this.transDocDate(),
        vehicleNo: this.vehicleNo(),
        vehicleType: this.vehicleType(),
        mainHsnCode: this.mainHsnCode(),
        itemList: [{
          itemNo: 1,
          productName: this.itemProductName(),
          productDesc: this.itemProductDesc(),
          hsnCode: this.itemHsnCode(),
          quantity: this.itemQuantity(),
          qtyUnit: this.itemQtyUnit(),
          taxableAmount: this.itemTaxableAmount(),
          sgstRate: this.itemSgstRate(),
          cgstRate: this.itemCgstRate(),
          igstRate: this.itemIgstRate(),
          cessRate: this.itemCessRate(),
          cessNonAdvol: this.itemCessNonAdvol()
        }]
      }]
    };
    return JSON.stringify(ewayBillJson, null, 2);
  }

  previewJson() {
    this.generatedJson.set(this.generateJson());
    this.showJsonPreview.set(true);
  }

  closePreview() {
    this.showJsonPreview.set(false);
  }

  downloadJson() {
    const json = this.generateJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eway-bill-${this.docNo() || 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openEwayPortal() {
    window.open('https://ewaybillgst.gov.in/', '_blank');
  }
}
