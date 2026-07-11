import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col sm:flex-row items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-auto rounded-b-xl">
      <div class="flex items-center w-full justify-between sm:w-auto sm:justify-start gap-4 mb-4 sm:mb-0">
        <p class="text-sm text-gray-700 whitespace-nowrap">
          Showing
          <span class="font-medium">{{ startIndex }}</span>
          to
          <span class="font-medium">{{ endIndex }}</span>
          of
          <span class="font-medium">{{ totalCount }}</span>
          results
        </p>
        <div class="flex items-center gap-2">
          <label class="text-sm text-gray-500 whitespace-nowrap">Rows per page:</label>
          <select 
            [ngModel]="pageSize" 
            (ngModelChange)="onPageSizeChange($event)"
            class="text-sm border-gray-300 rounded-md focus:ring-brand focus:border-brand py-1 pl-2 pr-6">
            <option [value]="25">25</option>
            <option [value]="50">50</option>
            <option [value]="100">100</option>
          </select>
        </div>
      </div>
      
      <div class="flex flex-1 items-center justify-end">
        <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button 
            [disabled]="page === 1"
            (click)="onPageChange(page - 1)"
            class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Previous</span>
            <span class="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          
          <!-- Simple Page Display -->
          <span class="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0">
            Page {{ page }} of {{ totalPages || 1 }}
          </span>

          <button 
            [disabled]="page >= totalPages"
            (click)="onPageChange(page + 1)"
            class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed">
            <span class="sr-only">Next</span>
            <span class="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </nav>
      </div>
    </div>
  `
})
export class PaginationComponent {
  @Input() page: number = 1;
  @Input() pageSize: number = 25;
  @Input() totalCount: number = 0;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  get totalPages(): number {
    const pages = Math.ceil(this.totalCount / this.pageSize);
    return pages === 0 ? 1 : pages;
  }

  get startIndex(): number {
    if (this.totalCount === 0) return 0;
    return (this.page - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    const end = this.page * this.pageSize;
    return end > this.totalCount ? this.totalCount : end;
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages) {
      this.pageChange.emit(newPage);
    }
  }

  onPageSizeChange(newSize: number) {
    this.pageSizeChange.emit(Number(newSize));
    // Reset to page 1 when page size changes
    this.pageChange.emit(1);
  }
}
