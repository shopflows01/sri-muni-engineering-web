import { Component, inject, computed } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { QuotationService } from '../../../core/services/quotation.service';

@Component({
  selector: 'app-quotation-view',
  imports: [],
  templateUrl: './quotation-view.html',
  styleUrl: './quotation-view.css',
})
export class QuotationView {
  private quotationService = inject(QuotationService);
  private sanitizer = inject(DomSanitizer);

  private readonly QUOTATION_ID = '838d8588-0aa8-4d2c-881e-5b3de2526da2';

  safePdfUrl = computed<SafeResourceUrl>(() => {
    const url = this.quotationService.getPreviewUrl(this.QUOTATION_ID);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

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
