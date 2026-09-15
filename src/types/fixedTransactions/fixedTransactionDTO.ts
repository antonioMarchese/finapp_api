import { Currency } from '../currency';
import { TransactionType } from '../transactions/transactionTypes';

export interface FixedTransactionPayment {
  id: number;
  amount: number;
  dueDate: Date;
}

export default interface FixedTransactionDTO {
  id: number;
  name: string;
  amount: number | null;
  currency: Currency;
  type: TransactionType;
  dueDay: number | null;
  active: boolean;
  category: {
    id: number;
    title: string;
    color?: string;
  };
  // The transaction generated from this template within the requested month,
  // or null when the bill has not been paid yet. Drives the monthly checklist.
  currentPayment: FixedTransactionPayment | null;
  createdAt: Date;
  updatedAt: Date;
}
