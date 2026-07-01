import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  imports: [],
  templateUrl: './empty-state.html',
  styleUrl: './empty-state.css'
})
export class EmptyState {
  title = input<string>('No data found');
  message = input<string>('There is nothing to display right now.');
  actionLabel = input<string>();
  action = output<void>();
}
