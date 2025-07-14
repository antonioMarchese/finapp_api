import Transaction from 'src/domain/entities/transaction';
import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';

export class InMemoTransactionsRepository extends TransactionsRepository<Transaction> {
  private transactions: Transaction[] = [];
  private lastId: number = 1;

  async create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO> {
    const newTransaction: Transaction = new Transaction(
      this.lastId,
      createTransactionProps.amount,
      createTransactionProps.dueDate,
      createTransactionProps.type,
      createTransactionProps.categoryId,
      createTransactionProps.description,
    );
    this.transactions.push(newTransaction);
    this.upgradeId();

    return await Promise.resolve(this.toDTO(newTransaction));
  }

  toDTO(transaction: Transaction): TransactionDTO {
    return {
      id: transaction.getId(),
      amount: transaction.getAmount(),
      dueDate: transaction.getDueDate(),
      type: transaction.getType(),
      categoryId: transaction.getCategoryId(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
      updatedAt: transaction.getUpdatedAt(),
    };
  }

  private upgradeId() {
    this.lastId++;
  }
}
