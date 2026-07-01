import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuotationService } from '../../../core/services/quotation.service';

@Component({
  selector: 'app-quotation-view',
  imports: [],
  templateUrl: './quotation-view.html',
  styleUrl: './quotation-view.css',
})
export class QuotationView implements OnInit {
  private quotationService = inject(QuotationService);
  private route = inject(ActivatedRoute);

  isLoading = signal(false);
  pdfUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  quotationId = signal<string | null>(null);

  ngOnInit() {
    // Check if a specific quotation id is passed via query param
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.quotationId.set(id);
    }
  }

  preview() {
    const id = this.quotationId();
    if (!id) {
      this.errorMessage.set('Please provide a quotation ID via the URL (e.g. ?id=...)');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.quotationService.getPdf(id, true).subscribe({
      next: (res) => {
        this.pdfUrl.set(res.downloadUrl);
        this.isLoading.set(false);
        if (res.downloadUrl) {
          window.open(res.downloadUrl, '_blank');
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to generate quotation PDF.');
      }
    });
  }

  download() {
    const id = this.quotationId();
    if (!id) {
      this.errorMessage.set('Please provide a quotation ID via the URL (e.g. ?id=...)');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.quotationService.getPdf(id, true).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.downloadUrl) {
          const a = document.createElement('a');
          a.href = res.downloadUrl;
          a.download = `quotation-${id}.pdf`;
          a.target = '_blank';
          a.click();
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to download quotation PDF.');
      }
    });
  }
}
