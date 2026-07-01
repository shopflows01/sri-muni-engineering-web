import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoaderService } from './core/services/loader.service';
import { LoaderOverlay } from './shared/components/loader-overlay/loader-overlay';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoaderOverlay],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  loaderService = inject(LoaderService);
}
