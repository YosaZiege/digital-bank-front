import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../models/customer.model';

const API_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class CustomerService {
  private http = inject(HttpClient);

  getCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API_URL}/customers`);
  }

  searchCustomers(keyword: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${API_URL}/customers/search`, {
      params: new HttpParams().set('keyword', keyword),
    });
  }

  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${API_URL}/customers/${id}`);
  }

  saveCustomer(customer: Omit<Customer, 'id'>): Observable<Customer> {
    return this.http.post<Customer>(`${API_URL}/customers`, customer);
  }

  updateCustomer(id: number, customer: Partial<Omit<Customer, 'id'>>): Observable<Customer> {
    return this.http.put<Customer>(`${API_URL}/customers/${id}`, customer);
  }

  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/customers/${id}`);
  }
}
