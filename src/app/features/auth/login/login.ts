import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'w-full max-w-[600px]' }
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  loginForm = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  isSubmitting = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  isForgotPassword = signal(false);
  resetForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    newUsername: [''],
    newPassword: ['']
  });

  toggleForgotPassword() {
    this.isForgotPassword.set(!this.isForgotPassword());
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.resetForm.reset();
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);
      
      this.authService.login(this.loginForm.getRawValue() as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
        },
        error: () => {
          this.isSubmitting.set(false);
          this.errorMessage.set("Couldn't sign in. Please check your details and try again.");
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onResetSubmit() {
    if (this.resetForm.valid) {
      const vals = this.resetForm.getRawValue();
      if (!vals.newUsername && !vals.newPassword) {
        this.errorMessage.set("Please provide either a new username or a new password.");
        return;
      }

      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      this.successMessage.set(null);
      
      this.authService.resetCredentials(vals as any).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.successMessage.set("Credentials updated successfully. Please sign in.");
          setTimeout(() => {
            this.toggleForgotPassword();
          }, 2000);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || "Couldn't update credentials.");
        }
      });
    } else {
      this.resetForm.markAllAsTouched();
    }
  }
}
