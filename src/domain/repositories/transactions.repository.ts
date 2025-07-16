import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

export default abstract class TransactionsRepository<EntityType = any> {
  abstract create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO>;
  abstract update(
    id: number,
    props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null>;
  abstract remove(id: number): Promise<null>;

  abstract findAll(): Promise<TransactionDTO[]>;
  abstract findById(id: number): Promise<TransactionDTO | null>;
  abstract toDTO(transaction: EntityType): TransactionDTO;
}
