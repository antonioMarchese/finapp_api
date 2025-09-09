import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import { PrismaService } from 'src/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';
import TransactionStats from 'src/types/transactions/transactionsStats';
import TypedAmountByCategory from 'src/types/transactions/amountByCategory';

@Injectable()
export class DBTransactionsRepository extends TransactionsRepository {
  itemsPerPage: number = 5;

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
  };

  private async getTypeAmount(
    type: 'income' | 'expense' | 'investment',
    filters,
  ): Promise<number> {
    const amount = await this.prismaService.transaction.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        ...filters,
        type,
      },
    });

    return amount._sum.amount ?? 0;
  }

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
          const filterOption = this.filterHashMapper[key](
            filters[key] as string,
          );
          Object.assign(queryOptions, filterOption);
        }
      });
    if (Object.keys(dueDateConditions).length > 0) {
      queryOptions.dueDate = dueDateConditions;
    }
    return queryOptions;
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
    const incomeAmount = await this.getTypeAmount('income', filtersDict);
    const expenseAmount = await this.getTypeAmount('expense', filtersDict);

    const count = await this.prismaService.transaction.count({
      where: filtersDict,
    });

    return await Promise.resolve({
      transactions: transactions as TransactionDTO[],
      count,
      income: incomeAmount,
      expense: expenseAmount,
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

  async getAmountByCategory(
    filters?: TransactionFilter,
  ): Promise<TypedAmountByCategory> {
    const filtersDict = this.buildFilters(filters ?? {});
    const categoryMapper = await this.getCategoriesMapper();

    const groupedTransactions = await this.prismaService.transaction.groupBy({
      by: ['categoryId', 'type'],
      where: filtersDict,
      _sum: {
        amount: true,
      },
    });

    const typedAmountByCategory = groupedTransactions.reduce(
      (acc, t) => ({
        ...acc,
        [t.type]: {
          ...acc[t.type],
          [categoryMapper[t.categoryId]]: t._sum.amount,
        },
      }),
      {
        income: {},
        expense: {},
        investment: {},
      } as TypedAmountByCategory,
    );

    return typedAmountByCategory;
  }
}
