import { Injectable, NotFoundException } from '@nestjs/common';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepo: TransactionsRepository,
    private readonly categoriesRepo: CategoriesRepository,
  ) {}

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

  async findAll(): Promise<TransactionDTO[]> {
    return await this.transactionsRepo.findAll();
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
