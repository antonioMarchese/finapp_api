import { Currency } from '../currency';

export default interface TransactionFilter {
  page?: number;
  categoryId?: number;
  type?: 'expense' | 'income' | 'investment';
  startDate?: Date;
  endDate?: Date;
  currency?: Currency;
}
