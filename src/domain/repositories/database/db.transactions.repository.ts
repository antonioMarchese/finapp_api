import TransactionsRepository from '../transactions.repository';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import { Transaction } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DBTransactionsRepository extends TransactionsRepository {
  itemsPerPage: number = 5;

  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private paginateTransactions(transactions: Transaction[], page: number) {
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return transactions.slice(startIndex, endIndex);
  }

  async findAllAndCount(
    filters?: TransactionFilter,
  ): Promise<{ transactions: TransactionDTO[]; count: number }> {
    let queryOptions: {
      skip?: number;
      take?: number;
      include: {
        category: {
          select: {
            id: true;
            title: true;
            color: true;
          };
        };
      };
    } = {
      include: {
        category: {
          select: {
            id: true,
            title: true,
            color: true,
          },
        },
      },
    };
    if (filters?.page) {
      queryOptions = {
        ...queryOptions,
        skip: (filters.page - 1) * this.itemsPerPage,
        take: this.itemsPerPage,
      };
    }

    const transactions =
      await this.prismaService.transaction.findMany(queryOptions);
    const count = transactions.length;

    /*  if (filters) {
      const { page } = filters;
      transactions = this.filterTransactions(filters, transactions);
      count = transactions.length;

      if (page) {
        transactions = this.paginateTransactions(transactions, page);
      }
    } */

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
