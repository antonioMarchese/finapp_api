import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import { PrismaService } from 'src/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from 'generated/prisma';

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
    startDate: (value: string) => {
      const startDate = new Date(value);
      startDate.setUTCHours(0, 0, 0, 0);
      return {
        dueDate: {
          gte: startDate,
        },
      };
    },
    endDate: (value: string) => {
      const endDate = new Date(value);
      endDate.setUTCHours(23, 59, 59, 0);
      return {
        dueDate: {
          lte: endDate,
        },
      };
    },
    type: (value: 'expense' | 'income' | 'investment') => ({
      type: value,
    }),
    categoryId: (value: string) => ({
      categoryId: Number(value),
    }),
  };

  private buildFilters(filters: TransactionFilter) {
    return Object.keys(filters)
      .filter((k) => filters[k] && k !== 'page')
      .reduce((queryOptions: Prisma.TransactionWhereInput, key) => {
        return {
          ...queryOptions,
          ...this.filterHashMapper[key](filters[key] as string),
        };
      }, {} as Prisma.TransactionWhereInput);
  }

  async findAllAndCount(
    filters?: TransactionFilter,
  ): Promise<{ transactions: TransactionDTO[]; count: number }> {
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
      orderBy: {
        dueDate: 'desc',
      },
    });
    const count = await this.prismaService.transaction.count({
      where: filtersDict,
    });

    return await Promise.resolve({
      transactions: transactions as TransactionDTO[],
      count,
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
}
