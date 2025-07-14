import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';

export default abstract class TransactionsRepository<EntityType = any> {
  abstract create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO>;

  abstract toDTO(transaction: EntityType): TransactionDTO;
}
