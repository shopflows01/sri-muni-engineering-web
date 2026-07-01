import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { StockService, PaginatedResponse } from '../../../core/services/stock';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { StockLedger as StockLedgerModel, Customer, Product } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

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
  ledgerItems = signal<StockLedgerModel[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  page = signal(1);

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  // Outward/Rejected edit
  editingItem = signal<StockLedgerModel | null>(null);
  outwardQty = signal<number>(0);
  rejectedQty = signal<number>(0);

  inwardForm = this.fb.group({
    dcNo: ['', Validators.required],
    dcDate: ['', Validators.required],
    customerId: ['', Validators.required],
    productId: ['', Validators.required],
    inwardQty: [0, [Validators.required, Validators.min(1)]]
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
        this.ledgerItems.set(res.items);
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
      this.stockService.createInward({
        dcNo: val.dcNo!,
        dcDate: new Date(val.dcDate!).toISOString(),
        customerId: val.customerId!,
        productId: val.productId!,
        inwardQty: val.inwardQty!
      }).subscribe({
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

  openOutward(item: StockLedgerModel) {
    this.editingItem.set(item);
    this.outwardQty.set(item.outwardQty);
    this.rejectedQty.set(item.rejectedQty);
  }

  saveOutward() {
    const item = this.editingItem();
    if (!item) return;
    this.stockService.updateOutward(item.id, this.outwardQty()).subscribe({
      next: () => {
        this.showSuccess('Outward quantity updated.');
        this.editingItem.set(null);
        this.loadLedger();
      }
    });
  }

  saveRejected() {
    const item = this.editingItem();
    if (!item) return;
    this.stockService.updateRejected(item.id, this.rejectedQty()).subscribe({
      next: () => {
        this.showSuccess('Rejected quantity updated.');
        this.editingItem.set(null);
        this.loadLedger();
      }
    });
  }

  cancelEdit() {
    this.editingItem.set(null);
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
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `stock-report-${from}-to-${to}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
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
