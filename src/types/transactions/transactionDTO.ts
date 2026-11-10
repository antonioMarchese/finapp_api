import { Currency } from '../currency';
import CreateTransactionDTO from './createTransactionDTO';

export default interface TransactionDTO
  extends Omit<CreateTransactionDTO, 'categoryId' | 'currency'> {
  id: number;
  currency: Currency;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    title: string;
    color?: string;
  };
}
