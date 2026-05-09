import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-new-customer',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './new-customer.html',
  styleUrl: './new-customer.css',
})
export class NewCustomer {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  loading = signal(false);
  error = signal<string | null>(null);

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.customerService.saveCustomer(this.form.value as { name: string; email: string }).subscribe({
      next: () => this.router.navigate(['/customers']),
      error: () => {
        this.loading.set(false);
        this.error.set('Failed to create customer. Please try again.');
      },
    });
  }
}
