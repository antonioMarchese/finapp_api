import Transaction from 'src/domain/entities/transaction';
import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import { inMemoCategories, inMemoTransactions } from './memo.db';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import buildInMemoTransactionFilter from 'src/utils/buildTransactionsFilter';
import TransactionStats from 'src/types/transactions/transactionsStats';
import AmountByCategoryResponse, {
  TypedAmountByCategory,
} from 'src/types/transactions/amountByCategory';
import MonthlySummaryDTO, {
  MonthlySummaryByMonth,
} from 'src/types/transactions/monthlySummaryDTO';
import { CurrencyTotals } from 'src/types/transactions/transactionPaginatedResponse';
import { DEFAULT_CURRENCY } from 'src/types/currency';

export class InMemoTransactionsRepository extends TransactionsRepository {
  private lastId: number = 1;
  itemsPerPage: number = 10;

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

  // Mirrors the database repository: totals are kept apart per currency.
  private buildTotals(
    transactions: Transaction[],
  ): Record<string, CurrencyTotals> {
    return transactions.reduce<Record<string, CurrencyTotals>>((acc, t) => {
      const currency = t.getCurrency();
      const type = t.getType();
      if (type !== 'income' && type !== 'expense') return acc;
      if (!acc[currency]) acc[currency] = { income: 0, expense: 0 };
      acc[currency][type] += t.getAmount();
      return acc;
    }, {});
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
      totals: this.buildTotals(transactions),
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
      createTransactionProps.currency ?? DEFAULT_CURRENCY,
      createTransactionProps.fixedTransactionId ?? null,
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
    transaction.setCurrency(props.currency ?? transaction.getCurrency());
    transaction.setUpdatedAt();

    return await Promise.resolve(this.toDTO(transaction));
  }

  async remove(id: number): Promise<null> {
    const index = inMemoTransactions.findIndex(
      (transaction) => transaction.getId() === id,
    );
    if (index !== -1) inMemoTransactions.splice(index, 1);

    return await Promise.resolve(null);
  }

  async removeMany(ids: number[]): Promise<number> {
    const before = inMemoTransactions.length;
    const remaining = inMemoTransactions.filter(
      (t) => !ids.includes(t.getId()),
    );
    inMemoTransactions.splice(0, inMemoTransactions.length, ...remaining);

    return await Promise.resolve(before - remaining.length);
  }

  async updateCategoryMany(ids: number[], categoryId: number): Promise<number> {
    const matching = inMemoTransactions.filter((t) => ids.includes(t.getId()));
    matching.forEach((t) => {
      t.setCategoryId(categoryId);
      t.setUpdatedAt();
    });

    return await Promise.resolve(matching.length);
  }

  async findExistingIds(ids: number[]): Promise<number[]> {
    return await Promise.resolve(
      inMemoTransactions.map((t) => t.getId()).filter((id) => ids.includes(id)),
    );
  }

  async getMonthlySummary(
    filters?: TransactionFilter,
  ): Promise<MonthlySummaryDTO> {
    // Built with a plain record so the per-currency buckets are known to
    // exist after ensureMonth; returned as the Partial-keyed DTO.
    const summary: Record<string, MonthlySummaryByMonth> = {};
    const transactions = filters
      ? this.filterTransactions(filters, [...inMemoTransactions])
      : [...inMemoTransactions];

    const ensureMonth = (currency: string, key: string) => {
      if (!summary[currency]) summary[currency] = {};
      if (!summary[currency][key])
        summary[currency][key] = { income: 0, expense: 0, balance: 0 };
    };

    const months: string[] = [];
    if (filters?.startDate && filters?.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      const cursor = new Date(
        Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1),
      );
      const stop = new Date(
        Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1),
      );
      while (cursor <= stop) {
        const year = cursor.getUTCFullYear();
        const month = String(cursor.getUTCMonth() + 1).padStart(2, '0');
        months.push(`${year}-${month}`);
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }

    transactions.forEach((t) => {
      const due = new Date(t.getDueDate());
      const year = due.getUTCFullYear();
      const month = String(due.getUTCMonth() + 1).padStart(2, '0');
      const key = `${year}-${month}`;
      const currency = t.getCurrency();

      months.forEach((m) => ensureMonth(currency, m));
      ensureMonth(currency, key);

      const type = t.getType();
      if (type === 'income') summary[currency][key].income += t.getAmount();
      else if (type === 'expense')
        summary[currency][key].expense += t.getAmount();
    });

    Object.keys(summary).forEach((currency) => {
      Object.keys(summary[currency]).forEach((key) => {
        summary[currency][key].balance =
          summary[currency][key].income - summary[currency][key].expense;
      });
    });

    return await Promise.resolve(summary);
  }

  async getAmountByCategory(
    filters?: TransactionFilter,
  ): Promise<AmountByCategoryResponse> {
    const transactions = filters
      ? this.filterTransactions(filters, [...inMemoTransactions])
      : [...inMemoTransactions];

    const amountByCategory = transactions.reduce<AmountByCategoryResponse>(
      (acc, transaction) => {
        const category = inMemoCategories.find(
          (category) => category.getId() === transaction.getCategoryId(),
        )!;
        const title = category.getTitle();
        const transactionType = transaction.getType();
        const transactionAmount = transaction.getAmount();
        const currency = transaction.getCurrency();

        if (!acc[currency]) {
          acc[currency] = {
            income: {},
            expense: {},
            investment: {},
          } as TypedAmountByCategory;
        }

        acc[currency]![transactionType][title] =
          (acc[currency]![transactionType][title] ?? 0) + transactionAmount;

        return acc;
      },
      {},
    );

    return Promise.resolve(amountByCategory);
  }

  toDTO(transaction: Transaction): TransactionDTO {
    const category = inMemoCategories.find(
      (category) => category.getId() === transaction.getCategoryId(),
    )!;

    return {
      id: transaction.getId(),
      amount: transaction.getAmount(),
      currency: transaction.getCurrency(),
      dueDate: transaction.getDueDate(),
      type: transaction.getType(),
      description: transaction.getDescription(),
      fixedTransactionId: transaction.getFixedTransactionId(),
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
