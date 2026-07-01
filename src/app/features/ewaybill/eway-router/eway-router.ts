import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { Invoice, Customer, Product } from '../../../shared/models/api.models';
import { PaginatedResponse } from '../../../core/services/invoice.service';
import { forkJoin } from 'rxjs';

export interface BillEntry {
  expanded: boolean;
  userGstin: string;
  supplyType: string;
  subSupplyType: number;
  subSupplyDesc: string;
  docType: string;
  docNo: string;
  docDate: string;
  transType: number;
  fromGstin: string;
  fromTrdName: string;
  fromAddr1: string;
  fromAddr2: string;
  fromPlace: string;
  fromPincode: number;
  fromStateCode: number;
  actualFromStateCode: number;
  toGstin: string;
  toTrdName: string;
  toAddr1: string;
  toAddr2: string;
  toPlace: string;
  toPincode: number;
  toStateCode: number;
  actualToStateCode: number;
  totalValue: number;
  cgstValue: number;
  sgstValue: number;
  igstValue: number;
  cessValue: number;
  totNonAdvolVal: number;
  othValue: number;
  totInvValue: number;
  transMode: number;
  transDistance: number;
  transporterName: string;
  transporterId: string;
  transDocNo: string;
  transDocDate: string;
  vehicleNo: string;
  vehicleType: string;
  mainHsnCode: string;
  itemProductName: string;
  itemProductDesc: string;
  itemHsnCode: string;
  itemQuantity: number;
  itemQtyUnit: string;
  itemTaxableAmount: number;
  itemSgstRate: number;
  itemCgstRate: number;
  itemIgstRate: number;
  itemCessRate: number;
  itemCessNonAdvol: number;
}

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

  customers = signal<Map<string, Customer>>(new Map());
  products = signal<Map<string, Product>>(new Map());
  isLoading = signal(false);
  showJsonPreview = signal(false);
  generatedJson = signal('');

  billEntries = signal<BillEntry[]>([]);

  ngOnInit() {
    this.loadCustomers();
    this.loadProducts();

    const invoiceIdsParam = this.route.snapshot.queryParamMap.get('invoiceIds');
    if (invoiceIdsParam) {
      const ids = invoiceIdsParam.split(',').filter(id => id.trim());
      if (ids.length > 0) {
        this.loadMultipleInvoices(ids);
      }
    }

    if (!invoiceIdsParam) {
      this.billEntries.set([this.createEmptyEntry()]);
    }
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

  private loadMultipleInvoices(ids: string[]) {
    this.isLoading.set(true);
    const requests = ids.map(id => this.invoiceService.getById(id));
    forkJoin(requests).subscribe({
      next: (invoices) => {
        const entries = invoices.map(inv => this.populateEntry(inv));
        this.billEntries.set(entries);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  private populateEntry(inv: Invoice): BillEntry {
    const customer = this.customers().get(inv.customerId);
    const product = this.products().get(inv.productId);

    const entry = this.createEmptyEntry();
    entry.expanded = true;
    entry.docNo = inv.invoiceNo;
    entry.docDate = new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });

    if (customer) {
      entry.toGstin = customer.gstin || '';
      entry.toTrdName = customer.name || '';
      entry.toAddr1 = customer.shippingAddress || customer.billingAddress || '';
      entry.toPincode = customer.pincode ? parseInt(customer.pincode) : 0;
      entry.toStateCode = customer.stateCode ? parseInt(customer.stateCode) : 0;
      entry.actualToStateCode = customer.stateCode ? parseInt(customer.stateCode) : 0;
    } else {
      entry.toTrdName = inv.customerName || '';
    }

    entry.totalValue = inv.taxableValue || 0;
    entry.cgstValue = inv.cgstAmount || 0;
    entry.sgstValue = inv.sgstAmount || 0;
    entry.igstValue = inv.igstAmount || 0;
    entry.totInvValue = inv.totalAmount || 0;

    entry.itemProductName = inv.partName || product?.partName || '';
    entry.itemProductDesc = inv.partNo || product?.partNo || '';
    entry.itemHsnCode = inv.hsnSac || product?.hsnSac || '';
    entry.mainHsnCode = inv.hsnSac || product?.hsnSac || '';
    entry.itemQuantity = inv.quantity || 0;
    entry.itemQtyUnit = product?.unit || 'NOS';
    entry.itemTaxableAmount = inv.taxableValue || 0;
    entry.itemIgstRate = inv.igstRate || 0;
    entry.itemCgstRate = inv.cgstRate || 0;
    entry.itemSgstRate = inv.sgstRate || 0;

    return entry;
  }

  createEmptyEntry(): BillEntry {
    return {
      expanded: false,
      userGstin: '',
      supplyType: 'O',
      subSupplyType: 1,
      subSupplyDesc: '',
      docType: 'INV',
      docNo: '',
      docDate: '',
      transType: 1,
      fromGstin: '',
      fromTrdName: 'SRI MUNI ENGINEERING',
      fromAddr1: '',
      fromAddr2: '',
      fromPlace: '',
      fromPincode: 0,
      fromStateCode: 0,
      actualFromStateCode: 0,
      toGstin: '',
      toTrdName: '',
      toAddr1: '',
      toAddr2: '',
      toPlace: '',
      toPincode: 0,
      toStateCode: 0,
      actualToStateCode: 0,
      totalValue: 0,
      cgstValue: 0,
      sgstValue: 0,
      igstValue: 0,
      cessValue: 0,
      totNonAdvolVal: 0,
      othValue: 0,
      totInvValue: 0,
      transMode: 1,
      transDistance: 0,
      transporterName: '',
      transporterId: '',
      transDocNo: '',
      transDocDate: '',
      vehicleNo: '',
      vehicleType: 'R',
      mainHsnCode: '',
      itemProductName: '',
      itemProductDesc: '',
      itemHsnCode: '',
      itemQuantity: 0,
      itemQtyUnit: 'NOS',
      itemTaxableAmount: 0,
      itemSgstRate: 0,
      itemCgstRate: 0,
      itemIgstRate: 0,
      itemCessRate: 0,
      itemCessNonAdvol: 0
    };
  }

  addEntry() {
    this.billEntries.update(entries => [...entries, this.createEmptyEntry()]);
  }

  removeEntry(index: number) {
    this.billEntries.update(entries => entries.filter((_, i) => i !== index));
  }

  toggleEntry(index: number) {
    this.billEntries.update(entries => entries.map((e, i) => i === index ? { ...e, expanded: !e.expanded } : e));
  }

  generateJson(): string {
    const ewayBillJson = {
      version: '1.0.1118',
      billLists: this.billEntries().map(entry => ({
        userGstin: entry.userGstin,
        supplyType: entry.supplyType,
        subSupplyType: entry.subSupplyType,
        subSupplyDesc: entry.subSupplyDesc,
        docType: entry.docType,
        docNo: entry.docNo,
        docDate: entry.docDate,
        transType: entry.transType,
        fromGstin: entry.fromGstin,
        fromTrdName: entry.fromTrdName,
        fromAddr1: entry.fromAddr1,
        fromAddr2: entry.fromAddr2,
        fromPlace: entry.fromPlace,
        fromPincode: entry.fromPincode,
        fromStateCode: entry.fromStateCode,
        actualFromStateCode: entry.actualFromStateCode,
        toGstin: entry.toGstin,
        toTrdName: entry.toTrdName,
        toAddr1: entry.toAddr1,
        toAddr2: entry.toAddr2,
        toPlace: entry.toPlace,
        toPincode: entry.toPincode,
        toStateCode: entry.toStateCode,
        actualToStateCode: entry.actualToStateCode,
        totalValue: entry.totalValue,
        cgstValue: entry.cgstValue,
        sgstValue: entry.sgstValue,
        igstValue: entry.igstValue,
        cessValue: entry.cessValue,
        TotNonAdvolVal: entry.totNonAdvolVal,
        OthValue: entry.othValue,
        totInvValue: entry.totInvValue,
        transMode: entry.transMode,
        transDistance: entry.transDistance,
        transporterName: entry.transporterName,
        transporterId: entry.transporterId,
        transDocNo: entry.transDocNo,
        transDocDate: entry.transDocDate,
        vehicleNo: entry.vehicleNo,
        vehicleType: entry.vehicleType,
        mainHsnCode: entry.mainHsnCode,
        itemList: [{
          itemNo: 1,
          productName: entry.itemProductName,
          productDesc: entry.itemProductDesc,
          hsnCode: entry.itemHsnCode,
          quantity: entry.itemQuantity,
          qtyUnit: entry.itemQtyUnit,
          taxableAmount: entry.itemTaxableAmount,
          sgstRate: entry.itemSgstRate,
          cgstRate: entry.itemCgstRate,
          igstRate: entry.itemIgstRate,
          cessRate: entry.itemCessRate,
          cessNonAdvol: entry.itemCessNonAdvol
        }]
      }))
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
    a.download = `eway-bill-${this.billEntries().length > 0 ? this.billEntries()[0].docNo || 'draft' : 'draft'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  openEwayPortal() {
    window.open('https://ewaybillgst.gov.in/', '_blank');
  }
}
