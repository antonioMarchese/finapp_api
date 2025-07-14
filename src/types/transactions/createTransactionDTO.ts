import { TransactionType } from './transactionTypes';

export default interface CreateTransactionDTO {
  amount: number;
  dueDate: Date;
  type: TransactionType;
  categoryId: number;
  description?: string;
}
