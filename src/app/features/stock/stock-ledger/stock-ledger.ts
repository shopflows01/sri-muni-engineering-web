import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StockService, PaginatedResponse } from '../../../core/services/stock';
import { CustomerService } from '../../../core/services/customer';
import { ProductService } from '../../../core/services/product';
import { JobWorkDC, Customer, Product } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-stock-ledger',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, EmptyState, PaginationComponent],
  templateUrl: './stock-ledger.html',
  styleUrl: './stock-ledger.css',
})
export class StockLedger implements OnInit {
  private stockService = inject(StockService);
  private customerService = inject(CustomerService);
  private productService = inject(ProductService);

  activeTab = signal<'list' | 'transactions'>('list');
  
  // Ledger list
  dcList = signal<JobWorkDC[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  page = signal(1);
  pageSize = signal(20);

  // Transactions list
  transactions = signal<any[]>([]);
  isTxLoading = signal(false);
  txTotalCount = signal(0);
  txPage = signal(1);
  txPageSize = signal(20);
  
  txFilters = {
    search: '',
    transactionType: '',
    customerId: '',
    fromDate: '',
    toDate: ''
  };

  customers = signal<Customer[]>([]);
  products = signal<Product[]>([]);

  successMessage = signal<string | null>(null);

  Math = Math;

  ngOnInit() {
    this.loadLedger();
    this.loadCustomers();
    this.loadProducts();
  }

  loadLedger() {
    this.isLoading.set(true);
    this.stockService.getAll({ page: this.page(), pageSize: this.pageSize() }).subscribe({
      next: (res) => {
        this.dcList.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  loadTransactions() {
    this.isTxLoading.set(true);
    const filters: any = { page: this.txPage(), pageSize: this.txPageSize() };
    if (this.txFilters.search) filters.search = this.txFilters.search;
    if (this.txFilters.transactionType) filters.transactionType = this.txFilters.transactionType;
    if (this.txFilters.customerId) filters.customerId = this.txFilters.customerId;
    if (this.txFilters.fromDate) filters.fromDate = this.txFilters.fromDate;
    if (this.txFilters.toDate) filters.toDate = this.txFilters.toDate;

    this.stockService.getTransactions(filters).subscribe({
      next: (res) => {
        this.transactions.set(res.items);
        this.txTotalCount.set(res.totalCount);
        this.isTxLoading.set(false);
      },
      error: () => this.isTxLoading.set(false)
    });
  }

  applyTxFilters() {
    this.txPage.set(1);
    this.loadTransactions();
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

  switchTab(tab: 'list' | 'transactions') {
    this.activeTab.set(tab);
    if (tab === 'list') {
      this.loadLedger();
    } else {
      this.loadTransactions();
    }
  }

  changePage(newPage: number) {
    this.page.set(newPage);
    this.loadLedger();
  }

  changeTxPage(newPage: number) {
    this.txPage.set(newPage);
    this.loadTransactions();
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


  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  getTotalQty(dc: JobWorkDC): number {
    return dc.items.reduce((acc, item) => acc + item.qtySent, 0);
  }
}
