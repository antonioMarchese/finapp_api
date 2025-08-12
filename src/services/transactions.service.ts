import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { Category } from 'generated/prisma';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import TransactionPaginatedResponse from 'src/types/transactions/transactionPaginatedResponse';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly categoriesRepo: CategoriesRepository<Category>,
  ) {}

  private isPageValid(page: number, count: number) {
    const totalPages =
      Math.ceil(count / this.transactionsRepo.itemsPerPage) || 1;

    return page <= totalPages;
  }

  private buildPaginatedResponse(
    page: number,
    count: number,
    transactions: TransactionDTO[],
    income: number,
    expense: number,
  ): TransactionPaginatedResponse {
    const totalPages = Math.ceil(count / this.transactionsRepo.itemsPerPage);
    const nextPage = page + 1 <= totalPages ? page + 1 : null;
    const prevPage = page > 1 ? page - 1 : null;

    return {
      page,
      next: nextPage,
      prev: prevPage,
      count,
      income,
      expense,
      results: transactions,
    };
  }

  async create(
    createTransactionProps: CreateTransactionDTO,
  ): Promise<TransactionDTO> {
    const category = await this.categoriesRepo.findById(
      createTransactionProps.categoryId,
    );

    if (!category) throw new NotFoundException('Invalid category');

    return await this.transactionsRepo.create(createTransactionProps);
  }

  async update(
    id: number,
    props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null> {
    const transaction = await this.transactionsRepo.findById(id);
    if (!transaction) throw new NotFoundException('Transaction not found');

    const category = await this.categoriesRepo.findById(props.categoryId);
    if (!category) throw new NotFoundException('Invalid category');

    return await this.transactionsRepo.update(id, props);
  }

  async findAll(
    filters?: TransactionFilter,
  ): Promise<TransactionDTO[] | TransactionPaginatedResponse> {
    const { transactions, count, income, expense } =
      await this.transactionsRepo.findAllAndCount(filters);
    if (filters?.page) {
      if (!this.isPageValid(Number(filters.page), count))
        throw new HttpException('Invalid page', 400);

      return this.buildPaginatedResponse(
        Number(filters.page),
        count,
        transactions,
        income,
        expense,
      );
    }

    return transactions;
  }

  async findById(id: number): Promise<TransactionDTO | null> {
    return await this.transactionsRepo.findById(id);
  }

  async remove(id: number): Promise<null> {
    const transaction = await this.transactionsRepo.findById(id);

    if (!transaction) throw new Error('Transaction not found');

    return await this.transactionsRepo.remove(id);
  }
}
