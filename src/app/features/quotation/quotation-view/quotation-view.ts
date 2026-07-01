import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuotationService } from '../../../core/services/quotation.service';

@Component({
  selector: 'app-quotation-view',
  imports: [],
  templateUrl: './quotation-view.html',
  styleUrl: './quotation-view.css',
})
export class QuotationView implements OnInit {
  private quotationService = inject(QuotationService);
  private sanitizer = inject(DomSanitizer);

  private readonly QUOTATION_ID = '838d8588-0aa8-4d2c-881e-5b3de2526da2';

  isLoading = signal(false);
  pdfUrl = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  safePdfUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.pdfUrl();
    return url ? this.sanitizer.bypassSecurityTrustResourceUrl(url) : null;
  });

  ngOnInit() {
    this.loadPreview();
  }

  loadPreview() {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.quotationService.getPdf(this.QUOTATION_ID, true).subscribe({
      next: (res) => {
        this.pdfUrl.set(res.downloadUrl);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err?.error?.message || 'Failed to load quotation PDF.');
      }
    });
  }

  download() {
    const url = this.pdfUrl();
    if (url) {
      const a = document.createElement('a');
      a.href = url;
      a.download = `quotation.pdf`;
      a.target = '_blank';
      a.click();
    }
  }
}
