import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe, DatePipe } from '@angular/common';
import { InvoiceService } from '../../../core/services/invoice.service';
import { Invoice } from '../../../shared/models/api.models';

@Component({
  selector: 'app-invoice-detail',
  imports: [DecimalPipe, DatePipe],
  templateUrl: './invoice-detail.html',
  styleUrl: './invoice-detail.css',
})
export class InvoiceDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);

  invoice = signal<Invoice | null>(null);
  isLoading = signal(true);

  isInvoiceComplete = computed(() => {
    const inv = this.invoice();
    return !!inv?.asnNo && !!inv?.ewbNo;
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.invoiceService.getById(id).subscribe({
        next: (inv) => {
          this.invoice.set(inv);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/invoices']);
        }
      });
    }
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
}
