import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../services/account';
import { BankAccount, AccountHistory } from '../../models/account.model';

type OperationTab = 'DEBIT' | 'CREDIT' | 'TRANSFER';

@Component({
  selector: 'app-accounts',
  imports: [ReactiveFormsModule, FormsModule, CurrencyPipe, DatePipe],
  templateUrl: './accounts.html',
  styleUrl: './accounts.css',
})
export class Accounts implements OnInit {
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  accountIdInput = '';
  account = signal<BankAccount | null>(null);
  history = signal<AccountHistory | null>(null);
  customerAccounts = signal<BankAccount[]>([]);
  currentPage = signal(0);
  readonly pageSize = 5;

  loading = signal(false);
  historyLoading = signal(false);
  operationLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  activeTab = signal<OperationTab>('DEBIT');

  debitForm = this.fb.group({
    accountId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
  });

  creditForm = this.fb.group({
    accountId: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
  });

  transferForm = this.fb.group({
    accountIdSource: ['', Validators.required],
    accountIdDestination: ['', Validators.required],
    amount: [null as number | null, [Validators.required, Validators.min(0.01)]],
    description: ['', Validators.required],
  });

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['customerId']) {
        this.loadCustomerAccounts(+params['customerId']);
      }
      if (params['accountId']) {
        this.accountIdInput = params['accountId'];
        this.searchAccount();
      }
    });
  }

  loadCustomerAccounts(customerId: number) {
    this.accountService.getCustomerAccounts(customerId).subscribe({
      next: (data) => this.customerAccounts.set(data),
      error: () => {},
    });
  }

  selectAccount(account: BankAccount) {
    this.accountIdInput = account.id;
    this.searchAccount();
  }

  searchAccount() {
    const id = this.accountIdInput.trim();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    this.account.set(null);
    this.history.set(null);
    this.accountService.getAccount(id).subscribe({
      next: (data) => {
        this.account.set(data);
        this.debitForm.patchValue({ accountId: data.id });
        this.creditForm.patchValue({ accountId: data.id });
        this.transferForm.patchValue({ accountIdSource: data.id });
        this.loading.set(false);
        this.loadHistory(0);
      },
      error: () => {
        this.error.set('Account not found. Please check the ID and try again.');
        this.loading.set(false);
      },
    });
  }

  loadHistory(page: number) {
    const id = this.account()?.id;
    if (!id) return;
    this.historyLoading.set(true);
    this.accountService.getAccountHistory(id, page, this.pageSize).subscribe({
      next: (data) => {
        this.history.set(data);
        this.currentPage.set(page);
        this.historyLoading.set(false);
      },
      error: () => this.historyLoading.set(false),
    });
  }

  submitDebit() {
    if (this.debitForm.invalid) return;
    this.operationLoading.set(true);
    this.error.set(null);
    this.accountService.debit(this.debitForm.value as any).subscribe({
      next: () => {
        this.showSuccess('Debit applied successfully!');
        this.debitForm.patchValue({ amount: null, description: '' });
        this.refreshAccount();
      },
      error: (err) => {
        this.operationLoading.set(false);
        this.error.set(err?.error?.message || 'Debit operation failed.');
      },
    });
  }

  submitCredit() {
    if (this.creditForm.invalid) return;
    this.operationLoading.set(true);
    this.error.set(null);
    this.accountService.credit(this.creditForm.value as any).subscribe({
      next: () => {
        this.showSuccess('Credit applied successfully!');
        this.creditForm.patchValue({ amount: null, description: '' });
        this.refreshAccount();
      },
      error: (err) => {
        this.operationLoading.set(false);
        this.error.set(err?.error?.message || 'Credit operation failed.');
      },
    });
  }

  submitTransfer() {
    if (this.transferForm.invalid) return;
    this.operationLoading.set(true);
    this.error.set(null);
    this.accountService.transfer(this.transferForm.value as any).subscribe({
      next: () => {
        this.showSuccess('Transfer completed successfully!');
        this.transferForm.patchValue({ accountIdDestination: '', amount: null, description: '' });
        this.refreshAccount();
      },
      error: (err) => {
        this.operationLoading.set(false);
        this.error.set(err?.error?.message || 'Transfer operation failed.');
      },
    });
  }

  private refreshAccount() {
    this.operationLoading.set(false);
    this.searchAccount();
  }

  private showSuccess(msg: string) {
    this.success.set(msg);
    setTimeout(() => this.success.set(null), 4000);
  }

  statusClass(status: string): string {
    const map: Record<string, string> = {
      ACTIVATED: 'bg-green-100 text-green-800',
      CREATED: 'bg-yellow-100 text-yellow-800',
      SUSPENDED: 'bg-red-100 text-red-800',
    };
    return map[status] ?? 'bg-gray-100 text-gray-800';
  }

  accountLabel(type: string): string {
    return type === 'CurrentBankAccount' ? 'Current Account' : 'Savings Account';
  }
}
