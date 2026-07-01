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

  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting.set(true);
      this.errorMessage.set(null);
      
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
}
