import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import { PrismaService } from 'src/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import TransactionStats from 'src/types/transactions/transactionsStats';
import AmountByCategoryResponse, {
  TypedAmountByCategory,
} from 'src/types/transactions/amountByCategory';
import MonthlySummaryDTO from 'src/types/transactions/monthlySummaryDTO';
import { CurrencyTotals } from 'src/types/transactions/transactionPaginatedResponse';
import { Currency } from 'src/types/currency';

@Injectable()
export class DBTransactionsRepository extends TransactionsRepository {
  itemsPerPage: number = 10;

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private filterHashMapper: Record<
    string,
    (value: string) => Prisma.TransactionWhereInput
  > = {
    type: (value: 'expense' | 'income' | 'investment') => ({
      type: value,
    }),
    categoryId: (value: string) => ({
      categoryId: Number(value),
    }),
    currency: (value: Currency) => ({
      currency: value,
    }),
  };

  private buildFilters(filters: TransactionFilter) {
    const queryOptions: Prisma.TransactionWhereInput = {};
    const dueDateConditions: { gte?: Date; lte?: Date } = {};
    Object.keys(filters)
      .filter((k) => filters[k] && k !== 'page')
      .forEach((key) => {
        if (key === 'startDate') {
          const startDate = new Date(filters[key] as Date);
          startDate.setUTCHours(0, 0, 0, 0);
          dueDateConditions.gte = startDate;
        } else if (key === 'endDate') {
          const endDate = new Date(filters[key] as Date);
          endDate.setUTCHours(23, 59, 59, 0);
          dueDateConditions.lte = endDate;
        } else {
          // Ignore query params that aren't filters (page, month, clear…)
          // instead of throwing on an unknown key.
          const buildFilter = this.filterHashMapper[key];
          if (!buildFilter) return;

          Object.assign(queryOptions, buildFilter(filters[key] as string));
        }
      });
    if (Object.keys(dueDateConditions).length > 0) {
      queryOptions.dueDate = dueDateConditions;
    }
    return queryOptions;
  }

  // Income and expense are summed per currency — amounts in different
  // currencies are never added together.
  private async getTotalsByCurrency(
    filters: Prisma.TransactionWhereInput,
  ): Promise<Record<string, CurrencyTotals>> {
    const grouped = await this.prismaService.transaction.groupBy({
      by: ['currency', 'type'],
      where: filters,
      _sum: { amount: true },
    });

    return grouped.reduce<Record<string, CurrencyTotals>>((acc, row) => {
      if (row.type !== 'income' && row.type !== 'expense') return acc;
      if (!acc[row.currency]) acc[row.currency] = { income: 0, expense: 0 };
      acc[row.currency][row.type] = row._sum.amount ?? 0;
      return acc;
    }, {});
  }

  private async getCategoriesMapper(): Promise<Record<string, string>> {
    const categories = await this.prismaService.category.findMany({
      select: {
        id: true,
        title: true,
      },
    });

    return categories.reduce(
      (acc, c) => ({
        ...acc,
        [c.id]: c.title,
      }),
      {},
    );
  }

  async findAllAndCount(
    filters?: TransactionFilter,
  ): Promise<TransactionStats> {
    const filtersDict = this.buildFilters(filters ?? {});
    let queryOptions: Prisma.TransactionFindManyArgs = {};

    if (filters?.page) {
      queryOptions = {
        skip: (filters.page - 1) * this.itemsPerPage,
        take: this.itemsPerPage,
      };
    }

    const transactions = await this.prismaService.transaction.findMany({
      where: filtersDict,
      ...queryOptions,
      include: {
        category: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
      orderBy: [
        {
          dueDate: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    const totals = await this.getTotalsByCurrency(filtersDict);

    const count = await this.prismaService.transaction.count({
      where: filtersDict,
    });

    return await Promise.resolve({
      transactions: transactions as TransactionDTO[],
      count,
      totals,
    });
  }

  async findById(id: number): Promise<TransactionDTO | null> {
    const transaction = await this.prismaService.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    if (!transaction) return await Promise.resolve(null);

    return await Promise.resolve(transaction as TransactionDTO);
  }

  async create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO> {
    const newTransaction = await this.prismaService.transaction.create({
      data: {
        ...createTransactionProps,
        dueDate: new Date(createTransactionProps.dueDate),
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return await Promise.resolve(newTransaction as TransactionDTO);
  }

  async update(
    id: number,
    props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null> {
    const transaction = await this.findById(id);

    if (!transaction) return await Promise.resolve(null);

    const updatedTransaction = await this.prismaService.transaction.update({
      where: { id },
      data: {
        amount: props.amount ?? transaction.amount,
        categoryId: props.categoryId ?? transaction.category.id,
        dueDate: props.dueDate ?? transaction.dueDate,
        description: props.description ?? transaction.description,
        type: props.type ?? transaction.type,
        currency: props.currency ?? transaction.currency,
      },
      include: {
        category: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    });

    return await Promise.resolve(updatedTransaction as TransactionDTO);
  }

  async remove(id: number): Promise<null> {
    await this.prismaService.transaction.delete({ where: { id } });

    return await Promise.resolve(null);
  }

  async removeMany(ids: number[]): Promise<number> {
    const { count } = await this.prismaService.transaction.deleteMany({
      where: { id: { in: ids } },
    });

    return count;
  }

  async updateCategoryMany(ids: number[], categoryId: number): Promise<number> {
    const { count } = await this.prismaService.transaction.updateMany({
      where: { id: { in: ids } },
      data: { categoryId },
    });

    return count;
  }

  async findExistingIds(ids: number[]): Promise<number[]> {
    const found = await this.prismaService.transaction.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });

    return found.map(({ id }) => id);
  }

  async getMonthlySummary(
    filters?: TransactionFilter,
  ): Promise<MonthlySummaryDTO> {
    const startDate = filters?.startDate
      ? this.startOfDay(new Date(filters.startDate))
      : null;
    const endDate = filters?.endDate
      ? this.endOfDay(new Date(filters.endDate))
      : null;
    const currency = filters?.currency ?? null;

    const rows = await this.prismaService.$queryRaw<
      Array<{ currency: string; month: string; type: string; total: number }>
    >`
      SELECT
        t.currency::text AS currency,
        TO_CHAR(t."dueDate", 'YYYY-MM') AS month,
        t.type::text AS type,
        SUM(t.amount)::float AS total
      FROM transactions t
      WHERE
        (${startDate}::timestamp IS NULL OR t."dueDate" >= ${startDate}::timestamp)
        AND (${endDate}::timestamp IS NULL OR t."dueDate" <= ${endDate}::timestamp)
        AND (${currency}::text IS NULL OR t.currency::text = ${currency}::text)
      GROUP BY t.currency, month, t.type
      ORDER BY t.currency, month
    `;

    const summary: MonthlySummaryDTO = {};

    // Every currency present gets the full month range, so a gap in one
    // currency still renders as zero rather than disappearing from the chart.
    const months: string[] = [];
    if (startDate && endDate) {
      const cursor = new Date(
        Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1),
      );
      const stop = new Date(
        Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1),
      );
      while (cursor <= stop) {
        months.push(this.toMonthKey(cursor));
        cursor.setUTCMonth(cursor.getUTCMonth() + 1);
      }
    }

    const ensureMonth = (curr: string, key: string) => {
      if (!summary[curr]) summary[curr] = {};
      if (!summary[curr][key])
        summary[curr][key] = { income: 0, expense: 0, balance: 0 };
    };

    rows.forEach((row) => {
      months.forEach((month) => ensureMonth(row.currency, month));
      ensureMonth(row.currency, row.month);
      if (row.type === 'income')
        summary[row.currency][row.month].income = row.total;
      else if (row.type === 'expense')
        summary[row.currency][row.month].expense = row.total;
    });

    Object.keys(summary).forEach((curr) => {
      Object.keys(summary[curr]).forEach((key) => {
        summary[curr][key].balance =
          summary[curr][key].income - summary[curr][key].expense;
      });
    });

    return summary;
  }

  private startOfDay(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  private endOfDay(date: Date): Date {
    const d = new Date(date);
    d.setUTCHours(23, 59, 59, 0);
    return d;
  }

  private toMonthKey(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  async getAmountByCategory(
    filters?: TransactionFilter,
  ): Promise<AmountByCategoryResponse> {
    const filtersDict = this.buildFilters(filters ?? {});
    const categoryMapper = await this.getCategoriesMapper();

    const groupedTransactions = await this.prismaService.transaction.groupBy({
      by: ['categoryId', 'type', 'currency'],
      where: filtersDict,
      _sum: {
        amount: true,
      },
    });

    return groupedTransactions.reduce<AmountByCategoryResponse>((acc, t) => {
      if (!acc[t.currency]) {
        acc[t.currency] = {
          income: {},
          expense: {},
          investment: {},
        } as TypedAmountByCategory;
      }

      const title = categoryMapper[t.categoryId];
      acc[t.currency]![t.type][title] = t._sum.amount ?? 0;

      return acc;
    }, {});
  }
}
