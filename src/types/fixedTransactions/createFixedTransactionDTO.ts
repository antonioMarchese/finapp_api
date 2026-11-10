import { Currency } from '../currency';
import { TransactionType } from '../transactions/transactionTypes';

export default interface CreateFixedTransactionDTO {
  name: string;
  categoryId: number;
  // Null for bills whose value changes every month (electricity, water).
  amount?: number | null;
  currency?: Currency;
  type?: TransactionType;
  // Day of the month the bill is due, used to date the generated transaction.
  dueDay?: number | null;
  active?: boolean;
}
