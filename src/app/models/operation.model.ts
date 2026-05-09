export interface DebitRequest {
  accountId: string;
  amount: number;
  description: string;
}

export interface CreditRequest {
  accountId: string;
  amount: number;
  description: string;
}

export interface TransferRequest {
  accountIdSource: string;
  accountIdDestination: string;
  amount: number;
  description: string;
}
