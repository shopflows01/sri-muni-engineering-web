import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoaderService } from '../services/loader.service';

export const loaderInterceptor: HttpInterceptorFn = (req, next) => {
  const loaderService = inject(LoaderService);
  
  // Show loader when request starts
  loaderService.show();
  
  // Hide loader when request completes or errors
  return next(req).pipe(
    finalize(() => {
      loaderService.hide();
    })
  );
};
