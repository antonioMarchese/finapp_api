import Transaction from 'src/domain/entities/transaction';
import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import { inMemoCategories, inMemoTransactions } from './memo.db';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

export class InMemoTransactionsRepository extends TransactionsRepository<Transaction> {
  private lastId: number = 1;

  async findAll(): Promise<TransactionDTO[]> {
    return await Promise.resolve(
      inMemoTransactions.map((transaction) => this.toDTO(transaction)),
    );
  }

  async findById(id: number): Promise<TransactionDTO | null> {
    const transaction = inMemoTransactions.find(
      (transaction) => transaction.getId() === id,
    );

    if (!transaction) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(transaction));
  }

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
    inMemoTransactions.push(newTransaction);
    this.upgradeId();

    return await Promise.resolve(this.toDTO(newTransaction));
  }

  async update(
    id: number,
    props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null> {
    const transaction = inMemoTransactions.find(
      (transaction) => transaction.getId() === id,
    )!;

    if (!transaction) return await Promise.resolve(null);

    transaction.setAmount(props.amount);
    transaction.setCategoryId(props.categoryId);
    transaction.setDueDate(props.dueDate);
    transaction.setDescription(
      props.description ?? transaction.getDescription(),
    );
    transaction.setType(props.type);
    transaction.setUpdatedAt();

    return await Promise.resolve(this.toDTO(transaction));
  }

  async remove(id: number): Promise<null> {
    const transaction = await this.findById(id);

    if (transaction) {
      inMemoCategories.splice(
        inMemoCategories.findIndex((category) => category.getId() === id),
      );
    }

    return await Promise.resolve(null);
  }

  toDTO(transaction: Transaction): TransactionDTO {
    const category = inMemoCategories.find(
      (category) => category.getId() === transaction.getCategoryId(),
    )!;

    return {
      id: transaction.getId(),
      amount: transaction.getAmount(),
      dueDate: transaction.getDueDate(),
      type: transaction.getType(),
      description: transaction.getDescription(),
      createdAt: transaction.getCreatedAt(),
      updatedAt: transaction.getUpdatedAt(),
      category: {
        id: category.getId(),
        title: category.getTitle(),
        color: category.getColor(),
      },
    };
  }

  private upgradeId() {
    this.lastId++;
  }
}
