import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
  host: { class: 'w-full max-w-[600px]' }
})
export class Signup {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  signupForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      
      this.authService.signup(this.signupForm.getRawValue() as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set("Couldn't create account. Please try again.");
        }
      });
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
