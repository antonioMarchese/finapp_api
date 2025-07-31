import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

export default abstract class TransactionsRepository {
  itemsPerPage: number;

  abstract create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO>;
  abstract update(
    id: number,
    props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null>;
  abstract remove(id: number): Promise<null>;

  abstract findAllAndCount(
    filters?: TransactionFilter,
  ): Promise<{ transactions: TransactionDTO[]; count: number }>;
  abstract findById(id: number): Promise<TransactionDTO | null>;
}
