import PaginatedResponse from '../paginatedResponse';
import TransactionDTO from './transactionDTO';

export default interface TransactionPaginatedResponse
  extends PaginatedResponse<TransactionDTO> {
  income: number;
  expense: number;
}
