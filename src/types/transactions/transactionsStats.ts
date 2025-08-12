import TransactionDTO from './transactionDTO';

export default interface TransactionStats {
  transactions: TransactionDTO[];
  count: number;
  income: number;
  expense: number;
}
