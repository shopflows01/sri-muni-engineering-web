import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockService, PaginatedResponse } from '../../../core/services/stock';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { JobWorkDC, Customer, Product } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

import { uppercaseStrings } from '../../../shared/utils/string-utils';

export interface LedgerViewModel {
  dcId: string;
  dcNo: string;
  dcDate: string;
  customerId: string;
  customerName: string;
  dcItemId: string;
  productId: string;
  partName: string;
  partNo: string;
  qtySent: number;
  rate?: number;
  gstPercent?: number;
  inwardQty: number;
  outwardQty: number;
  rejectedQty: number;
  pendingQty: number;
}

@Component({
  selector: 'app-stock-ledger',
  imports: [ReactiveFormsModule, EmptyState],
  templateUrl: './stock-ledger.html',
  styleUrl: './stock-ledger.css',
})
export class StockLedger implements OnInit {
  private stockService = inject(StockService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);
  private fb = inject(FormBuilder);

  activeTab = signal<'list' | 'inward'>('list');
  ledgerItems = signal<LedgerViewModel[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  page = signal(1);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  // Outward/Rejected edit
  editingItem = signal<LedgerViewModel | null>(null);
  outwardQty = signal<number>(0);
  rejectedQty = signal<number>(0);

  inwardForm = this.fb.group({
    dcNo: ['', Validators.required],
    dcDate: ['', Validators.required],
    customerId: ['', Validators.required],
    productId: ['', Validators.required],
    qtySent: [0, [Validators.required, Validators.min(1)]],
    rate: [0, [Validators.min(0)]],
    gstPercent: [18, [Validators.min(0)]]
  });

  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);

  // Export Excel
  showExportDialog = signal(false);
  exportFromDate = signal('');
  exportToDate = signal('');
  isExporting = signal(false);

  ngOnInit() {
    this.loadLedger();
    this.loadCustomers();
    this.loadProducts();
  }

  loadLedger() {
    this.isLoading.set(true);
    this.stockService.getAll({ page: this.page(), pageSize: 20 }).subscribe({
      next: (res) => {
        const viewModels: LedgerViewModel[] = [];
        for (const dc of res.items) {
          for (const item of dc.items) {
            viewModels.push({
              dcId: dc.id,
              dcNo: dc.dcNo,
              dcDate: dc.dcDate,
              customerId: dc.customerId,
              customerName: dc.customerName,
              dcItemId: item.id,
              productId: item.productId,
              partName: item.partName,
              partNo: item.partNo,
              qtySent: item.qtySent,
              rate: item.rate,
              gstPercent: item.gstPercent,
              inwardQty: item.inwardQty,
              outwardQty: item.outwardQty,
              rejectedQty: item.rejectedQty,
              pendingQty: item.pendingQty
            });
          }
        }
        this.ledgerItems.set(viewModels);
        this.totalCount.set(res.totalCount);
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

  switchTab(tab: 'list' | 'inward') {
    this.activeTab.set(tab);
    if (tab === 'list') this.loadLedger();
  }

  submitInward() {
    if (this.inwardForm.valid) {
      this.isSubmitting.set(true);
      const val = this.inwardForm.getRawValue();
      let payload = {
        dcNo: val.dcNo!,
        dcDate: val.dcDate!,
        customerId: val.customerId!,
        items: [{
          productId: val.productId!,
          qtySent: val.qtySent!,
          rate: val.rate!,
          gstPercent: val.gstPercent!
        }]
      };
      payload = uppercaseStrings(payload);
      
      this.stockService.createDC(payload).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.inwardForm.reset();
          this.showSuccess('Inward entry saved successfully.');
          this.switchTab('list');
        },
        error: () => this.isSubmitting.set(false)
      });
    } else {
      this.inwardForm.markAllAsTouched();
    }
  }

  openOutward(item: LedgerViewModel) {
    this.editingItem.set(item);
    this.outwardQty.set(0); // Assuming you're recording a new transaction
    this.rejectedQty.set(0);
  }

  saveOutward() {
    const item = this.editingItem();
    if (!item || !this.outwardQty()) return;
    this.stockService.addTransaction(item.dcItemId, {
      transactionType: 1, // Outward
      transactionDate: new Date().toISOString().split('T')[0],
      quantity: this.outwardQty()
    }).subscribe({
      next: () => {
        this.showSuccess('Outward transaction added.');
        this.editingItem.set(null);
        this.loadLedger();
      }
    });
  }

  saveRejected() {
    const item = this.editingItem();
    if (!item || !this.rejectedQty()) return;
    this.stockService.addTransaction(item.dcItemId, {
      transactionType: 2, // Rejected
      transactionDate: new Date().toISOString().split('T')[0],
      quantity: this.rejectedQty()
    }).subscribe({
      next: () => {
        this.showSuccess('Rejected transaction added.');
        this.editingItem.set(null);
        this.loadLedger();
      }
    });
  }

  cancelEdit() {
    this.editingItem.set(null);
  }

  deleteLedger(id: string) {
    if (confirm('Are you sure you want to delete this DC entry? This will delete all items and transactions.')) {
      this.stockService.delete(id).subscribe({
        next: () => {
          this.showSuccess('DC entry deleted successfully.');
          this.loadLedger();
        },
        error: (err) => {
          alert('Failed to delete DC entry. It may be linked to an invoice.');
        }
      });
    }
  }

  openExportDialog() {
    this.showExportDialog.set(true);
  }

  closeExportDialog() {
    this.showExportDialog.set(false);
  }

  submitExport() {
    const from = this.exportFromDate();
    const to = this.exportToDate();
    if (!from || !to) return;
    this.isExporting.set(true);
    this.stockService.exportExcel(from, to).subscribe({
      next: (res) => {
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
        }
        this.isExporting.set(false);
        this.showExportDialog.set(false);
      },
      error: () => this.isExporting.set(false)
    });
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
