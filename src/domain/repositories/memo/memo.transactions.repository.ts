import Transaction from 'src/domain/entities/transaction';
import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import { inMemoCategories, inMemoTransactions } from './memo.db';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import buildInMemoTransactionFilter from 'src/utils/buildTransactionsFilter';
import TransactionStats from 'src/types/transactions/transactionsStats';

export class InMemoTransactionsRepository extends TransactionsRepository {
  private lastId: number = 1;
  itemsPerPage: number = 5;

  private filterTransactions(
    filters: TransactionFilter,
    transactions: Transaction[],
  ) {
    return Object.keys(filters)
      .filter((k) => k !== 'page')
      .reduce(
        (filteredTransactions, key) => {
          return [
            ...filteredTransactions.filter((t) =>
              buildInMemoTransactionFilter(key)(t, filters[key] as string),
            ),
          ];
        },
        [...transactions],
      );
  }

  private paginateTransactions(transactions: Transaction[], page: number) {
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return transactions.slice(startIndex, endIndex);
  }

  async findAllAndCount(
    filters?: TransactionFilter,
  ): Promise<TransactionStats> {
    let transactions = [...inMemoTransactions];
    let count = transactions.length;

    if (filters) {
      const { page } = filters;
      transactions = this.filterTransactions(filters, transactions);
      count = transactions.length;

      if (page) {
        transactions = this.paginateTransactions(transactions, page);
      }
    }

    return await Promise.resolve({
      transactions: transactions.map((transaction) => this.toDTO(transaction)),
      count,
      income: transactions.reduce((acc, transaction) => {
        return acc + transaction.getAmount();
      }, 0),
      expense: transactions.reduce((acc, transaction) => {
        return acc + transaction.getAmount();
      }, 0),
    });
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
