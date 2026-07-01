import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, DatePipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../shared/models/api.models';

@Component({
  selector: 'app-invoice-detail',
  imports: [DecimalPipe, DatePipe, FormsModule],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);

  invoice = signal<Invoice | null>(null);
  isLoading = signal(true);
  isUpdating = signal(false);
  successMessage = signal<string | null>(null);

  // Editable fields
  asnNo = signal('');
  ewbNo = signal('');

  isInvoiceComplete = computed(() => {
    return !!this.asnNo() && !!this.ewbNo();
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getById(id).subscribe({
        next: (inv) => {
          this.invoice.set(inv);
          this.asnNo.set(inv.asnNo || '');
          this.ewbNo.set(inv.ewbNo || '');
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/invoices']);
        }
      });
    }
  }

  updateInvoice() {
    const inv = this.invoice();
    if (!inv) return;
    this.isUpdating.set(true);
    this.invoiceService.update(inv.id, {
      ...inv,
      asnNo: this.asnNo(),
      ewbNo: this.ewbNo()
    }).subscribe({
      next: (updated) => {
        this.invoice.set(updated);
        this.isUpdating.set(false);
        this.showSuccess('Invoice updated successfully.');
      },
      error: () => this.isUpdating.set(false)
    });
  }

  downloadPdf() {
    const inv = this.invoice();
    if (!inv) return;
    this.invoiceService.getPdf(inv.id).subscribe({
      next: (res) => {
        if (res.downloadUrl) window.open(res.downloadUrl, '_blank');
      }
    });
  }

  generateEwayBill() {
    const inv = this.invoice();
    if (!inv) return;
    this.router.navigate(['/ewaybill'], { queryParams: { invoiceId: inv.id } });
  }

  goBack() {
    this.router.navigate(['/invoices']);
  }

  private showSuccess(msg: string) {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
