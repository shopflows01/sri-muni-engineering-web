import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../shared/models/api.models';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';

@Component({
  selector: 'app-invoice-list',
  imports: [RouterLink, DatePipe, DecimalPipe, EmptyState, FormsModule],
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

  showPdfDialog = signal(false);
  selectedInvoiceForPdf = signal<Invoice | null>(null);
  pdfOptions = {
    original: false,
    duplicate: false,
    triplicate: false
  };

  openPdfDialog(invoice: Invoice) {
    this.selectedInvoiceForPdf.set(invoice);
    this.pdfOptions = { original: false, duplicate: false, triplicate: false };
    this.showPdfDialog.set(true);
  }

  closePdfDialog() {
    this.showPdfDialog.set(false);
    this.selectedInvoiceForPdf.set(null);
  }

  confirmPdfDownload() {
    const invoice = this.selectedInvoiceForPdf();
    if (!invoice) return;

    const params = {
      originalForRecipient: this.pdfOptions.original,
      duplicateForTransporter: this.pdfOptions.duplicate,
      triplicateForSupplier: this.pdfOptions.triplicate
    };

    this.invoiceService.getPdfPreview(invoice.id, params).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        this.closePdfDialog();
      },
      error: (err) => {
        console.error('Failed to generate PDF:', err);
        alert('Failed to generate PDF. Please try again.');
        this.closePdfDialog();
      }
    });
  }
}
