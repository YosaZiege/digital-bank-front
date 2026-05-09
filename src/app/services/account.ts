import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount, AccountHistory, DashboardStats } from '../models/account.model';
import { DebitRequest, CreditRequest, TransferRequest } from '../models/operation.model';

const API_URL = 'http://localhost:8081/api';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private http = inject(HttpClient);

  getAccount(accountId: string): Observable<BankAccount> {
    return this.http.get<BankAccount>(`${API_URL}/accounts/${accountId}`);
  }

  getAccountHistory(accountId: string, page: number, size: number): Observable<AccountHistory> {
    return this.http.get<AccountHistory>(`${API_URL}/accounts/${accountId}/pageOperations`, {
      params: new HttpParams().set('page', page).set('size', size),
    });
  }

  getCustomerAccounts(customerId: number): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${API_URL}/accounts/customer/${customerId}`);
  }

  debit(request: DebitRequest): Observable<void> {
    return this.http.post<void>(`${API_URL}/accounts/debit`, request);
  }

  credit(request: CreditRequest): Observable<void> {
    return this.http.post<void>(`${API_URL}/accounts/credit`, request);
  }

  transfer(request: TransferRequest): Observable<void> {
    return this.http.post<void>(`${API_URL}/accounts/transfer`, request);
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${API_URL}/stats`);
  }
}
