import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer';

@Component({
  selector: 'app-customers',
  imports: [RouterLink, FormsModule],
  templateUrl: './customers.html',
  styleUrl: './customers.css',
})
export class Customers implements OnInit {
  private customerService = inject(CustomerService);

  customers = signal<Customer[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  searchInput = '';

  editingCustomer = signal<Customer | null>(null);
  editForm = { name: '', email: '' };

  ngOnInit() {
    this.loadCustomers();
  }

  loadCustomers() {
    this.loading.set(true);
    this.error.set(null);
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load customers.');
        this.loading.set(false);
      },
    });
  }

  search() {
    if (!this.searchInput.trim()) {
      this.loadCustomers();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.customerService.searchCustomers(this.searchInput).subscribe({
      next: (data) => {
        this.customers.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Search failed.');
        this.loading.set(false);
      },
    });
  }

  clearSearch() {
    this.searchInput = '';
    this.loadCustomers();
  }

  startEdit(customer: Customer) {
    this.editingCustomer.set(customer);
    this.editForm = { name: customer.name, email: customer.email };
  }

  cancelEdit() {
    this.editingCustomer.set(null);
  }

  saveEdit() {
    const c = this.editingCustomer();
    if (!c) return;
    this.customerService.updateCustomer(c.id, this.editForm).subscribe({
      next: () => {
        this.editingCustomer.set(null);
        this.loadCustomers();
      },
      error: () => this.error.set('Failed to update customer.'),
    });
  }

  deleteCustomer(id: number) {
    if (!confirm('Delete this customer? This action cannot be undone.')) return;
    this.customerService.deleteCustomer(id).subscribe({
      next: () => this.loadCustomers(),
      error: () => this.error.set('Failed to delete customer.'),
    });
  }
}
