import { Component, inject, signal, OnInit } from '@angular/core';
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

  isLoading = signal(true);
  safePdfUrl = signal<SafeResourceUrl | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit() {
    this.quotationService.getPreviewBlob(this.QUOTATION_ID).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        this.safePdfUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('Failed to load quotation preview.');
        this.isLoading.set(false);
      }
    });
  }

  download() {
    this.quotationService.getPdf(this.QUOTATION_ID, true).subscribe({
      next: (res) => {
        if (res.downloadUrl) {
          const a = document.createElement('a');
          a.href = res.downloadUrl;
          a.download = 'quotation.pdf';
          a.target = '_blank';
          a.click();
        }
      }
    });
  }
}
