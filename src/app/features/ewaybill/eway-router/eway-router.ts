import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { CustomerService } from '../../../core/services/customer';
import { Invoice, Customer } from '../../../shared/models/api.models';

@Component({
  selector: 'app-eway-router',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './eway-router.html',
  styleUrl: './eway-router.css',
})
export class EwayRouter implements OnInit {
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private customerService = inject(CustomerService);
  private fb = inject(FormBuilder);

  invoices = signal<Invoice[]>([]);
  customers = signal<Map<string, Customer>>(new Map());
  isLoading = signal(false);
  showJsonPreview = signal(false);
  generatedJson = signal<string>('');

  // E-Way Bill form fields per invoice
  transporterName = signal('');
  transporterId = signal('');
  transDocNo = signal('');
  transDocDate = signal('');
  vehicleNo = signal('');
  transDistance = signal(0);

  ngOnInit() {
    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');
    if (invoiceId) {
      this.loadSingleInvoice(invoiceId);
    }
  }

  private loadSingleInvoice(id: string) {
    this.isLoading.set(true);
    this.invoiceService.getById(id).subscribe({
      next: (inv) => {
        this.invoices.set([inv]);
        this.isLoading.set(false);
        if (inv.customerId) {
          this.customerService.getCustomers('', 1, 100).subscribe({
            next: (res) => {
              const map = new Map<string, Customer>();
              res.items.forEach(c => map.set(c.id, c));
              this.customers.set(map);
            }
          });
        }
      },
      error: () => this.isLoading.set(false)
    });
  }

  generateJson() {
    const invoices = this.invoices();
    const customers = this.customers();

    const billLists = invoices.map(inv => {
      const customer = customers.get(inv.customerId);
      return {
        userGstin: '',
        supplyType: 'O',
        subSupplyType: 1,
        subSupplyDesc: '',
        docType: 'INV',
        docNo: inv.invoiceNo,
        docDate: new Date(inv.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        transType: 1,
        fromGstin: '',
        fromTrdName: 'SRI MUNI ENGINEERING',
        fromAddr1: '',
        fromAddr2: '',
        fromPlace: '',
        fromPincode: 0,
        fromStateCode: 0,
        actualFromStateCode: 0,
        toGstin: customer?.gstin || '',
        toTrdName: customer?.name || inv.customerName || '',
        toAddr1: customer?.shippingAddress || '',
        toAddr2: '',
        toPlace: '',
        toPincode: customer?.pincode ? parseInt(customer.pincode) : 0,
        toStateCode: customer?.stateCode ? parseInt(customer.stateCode) : 0,
        actualToStateCode: customer?.stateCode ? parseInt(customer.stateCode) : 0,
        totalValue: inv.taxableAmount,
        cgstValue: inv.cgstAmount,
        sgstValue: inv.sgstAmount,
        igstValue: inv.igstAmount,
        cessValue: 0,
        TotNonAdvolVal: 0,
        OthValue: 0,
        totInvValue: inv.totalAmount,
        transMode: 1,
        transDistance: this.transDistance(),
        transporterName: this.transporterName(),
        transporterId: this.transporterId(),
        transDocNo: this.transDocNo(),
        transDocDate: this.transDocDate(),
        vehicleNo: this.vehicleNo(),
        vehicleType: 'R',
        itemList: [{
          itemNo: 1,
          productName: inv.partName || '',
          productDesc: inv.partNo || '',
          hsnCode: '',
          quantity: inv.quantity,
          qtyUnit: 'NOS',
          taxableAmount: inv.taxableAmount,
          sgstRate: inv.sgstAmount > 0 ? 9 : 0,
          cgstRate: inv.cgstAmount > 0 ? 9 : 0,
          igstRate: inv.igstAmount > 0 ? 18 : 0,
          cessRate: 0,
          cessNonAdvol: 0
        }]
      };
    });

    const ewayBillJson = {
      version: '1.0.1118',
      billLists
    };

    this.generatedJson.set(JSON.stringify(ewayBillJson, null, 2));
  }

  previewJson() {
    this.generateJson();
    this.showJsonPreview.set(true);
  }

  closePreview() {
    this.showJsonPreview.set(false);
  }

  downloadJson() {
    this.generateJson();
    const blob = new Blob([this.generatedJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eway-bill.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  openEwayPortal() {
    window.open('https://ewaybillgst.gov.in/', '_blank');
  }
}
