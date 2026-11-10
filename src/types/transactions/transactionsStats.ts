import { ByCurrency } from '../currency';
import TransactionDTO from './transactionDTO';
import { CurrencyTotals } from './transactionPaginatedResponse';

export default interface TransactionStats {
  transactions: TransactionDTO[];
  count: number;
  totals: ByCurrency<CurrencyTotals>;
}
