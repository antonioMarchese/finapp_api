import { Currency } from '../currency';
import { TransactionType } from './transactionTypes';

export default interface CreateTransactionDTO {
  amount: number;
  dueDate: Date;
  type: TransactionType;
  categoryId: number;
  description?: string;
  currency?: Currency;
  fixedTransactionId?: number | null;
}
