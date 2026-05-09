import { Customer } from './customer.model';

export type AccountStatus = 'CREATED' | 'ACTIVATED' | 'SUSPENDED';
export type AccountType = 'CurrentBankAccount' | 'SavingBankAccount';

export interface BankAccount {
  type: AccountType;
  id: string;
  balance: number;
  createdAt: string;
  status: AccountStatus;
  customerDTO: Customer;
  overDraft?: number;
  interestRate?: number;
}

export interface AccountHistory {
  accountId: string;
  balance: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  accountOperationDTOs: AccountOperation[];
}

export interface AccountOperation {
  id: number;
  operationDate: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  description: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalAccounts: number;
  totalOperations: number;
  accountsByType: Record<string, number>;
  operationsByDay: { date: string; count: number }[];
}
