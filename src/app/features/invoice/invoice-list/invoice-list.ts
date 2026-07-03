import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-invoice-list',
  imports: [RouterLink, DatePipe, DecimalPipe, EmptyState],
  templateUrl: './invoice-list.html',
  styleUrl: './invoice-list.css',
})
export class InvoiceList implements OnInit {
  private invoiceService = inject(InvoiceService);
  router = inject(Router);

  invoices = signal<Invoice[]>([]);
  isLoading = signal(false);
  totalCount = signal(0);
  page = signal(1);
  selectedIds = signal<Set<string>>(new Set());

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading.set(true);
    this.invoiceService.getAll({ page: this.page(), pageSize: 20 }).subscribe({
      next: (res) => {
        this.invoices.set(res.items);
        this.totalCount.set(res.totalCount);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  toggleSelect(id: string) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  get hasSelection(): boolean {
    return this.selectedIds().size > 0;
  }

  generateEwayBill() {
    const ids = Array.from(this.selectedIds());
    this.router.navigate(['/ewaybill'], { queryParams: { invoiceIds: ids.join(',') } });
  }

  downloadPdf(invoice: Invoice) {
    this.invoiceService.getPdfPreview(invoice.id, { originalForRecipient: true }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      }
    });
  }
}
