import { ByCurrency } from '../currency';
import PaginatedResponse from '../paginatedResponse';
import TransactionDTO from './transactionDTO';

export interface CurrencyTotals {
  income: number;
  expense: number;
}

export default interface TransactionPaginatedResponse
  extends PaginatedResponse<TransactionDTO> {
  // One entry per currency present in the filtered set; never summed together.
  totals: ByCurrency<CurrencyTotals>;
}
