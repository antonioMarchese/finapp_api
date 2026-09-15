import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from 'generated/prisma';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import FixedTransactionsRepository from 'src/domain/repositories/fixedTransactions.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import CreateFixedTransactionDTO from 'src/types/fixedTransactions/createFixedTransactionDTO';
import FixedTransactionDTO from 'src/types/fixedTransactions/fixedTransactionDTO';
import PayFixedTransactionDTO from 'src/types/fixedTransactions/payFixedTransactionDTO';
import UpdateFixedTransactionDTO from 'src/types/fixedTransactions/updateFixedTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import { isCurrency } from 'src/types/currency';
import { dateForDueDay, resolveMonthRange } from 'src/utils/monthRange';
import { AppSettings } from 'generated/prisma';

@Injectable()
export class FixedTransactionsService {
  constructor(
    private readonly repository: FixedTransactionsRepository<unknown>,
    private readonly categoriesRepo: CategoriesRepository<Category>,
    private readonly transactionsRepo: TransactionsRepository,
    private readonly settingsRepo: SettingsRepository<AppSettings>,
  ) {}

  private async assertCategoryExists(categoryId?: number): Promise<void> {
    if (categoryId === undefined) return;

    const category = await this.categoriesRepo.findById(categoryId);
    if (!category) throw new NotFoundException('Invalid category');
  }

  private assertCurrency(currency?: string): void {
    if (currency !== undefined && !isCurrency(currency)) {
      throw new Error('Invalid currency');
    }
  }

  private assertDueDay(dueDay?: number | null): void {
    if (dueDay === undefined || dueDay === null) return;
    if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 31) {
      throw new Error('Due day must be a whole number between 1 and 31');
    }
  }

  async findAll(month?: string): Promise<FixedTransactionDTO[]> {
    return await this.repository.findAll(resolveMonthRange(month));
  }

  async findById(
    id: number,
    month?: string,
  ): Promise<FixedTransactionDTO | null> {
    return await this.repository.findById(id, resolveMonthRange(month));
  }

  async create(props: CreateFixedTransactionDTO): Promise<FixedTransactionDTO> {
    if (!props.name?.trim()) throw new Error('Name is required');
    this.assertCurrency(props.currency);
    this.assertDueDay(props.dueDay);
    await this.assertCategoryExists(props.categoryId);

    // Falls back to the configured default so templates stay consistent
    // with the rest of the app when the caller omits a currency.
    const settings = await this.settingsRepo.get();

    return await this.repository.create({
      ...props,
      currency: props.currency ?? settings.defaultCurrency,
      type: props.type ?? 'expense',
    });
  }

  async update(
    id: number,
    props: UpdateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    const fixedTransaction = await this.findById(id);
    if (!fixedTransaction) throw new NotFoundException('Fixed transaction not found');

    if (props.name !== undefined && !props.name.trim())
      throw new Error('Name is required');
    this.assertCurrency(props.currency);
    this.assertDueDay(props.dueDay);
    await this.assertCategoryExists(props.categoryId);

    return await this.repository.update(id, props);
  }

  async remove(id: number): Promise<null> {
    const fixedTransaction = await this.findById(id);
    if (!fixedTransaction) throw new NotFoundException('Fixed transaction not found');

    return await this.repository.remove(id);
  }

  // Generates the real transaction for a month from the template. The caller
  // only supplies what differs this month — a variable amount, a late date.
  async pay(
    id: number,
    props: PayFixedTransactionDTO,
    month?: string,
  ): Promise<TransactionDTO> {
    const monthRange = resolveMonthRange(month);
    const fixedTransaction = await this.repository.findById(id, monthRange);
    if (!fixedTransaction)
      throw new NotFoundException('Fixed transaction not found');

    if (fixedTransaction.currentPayment)
      throw new Error('This fixed transaction was already paid for this month');

    this.assertCurrency(props.currency);

    const amount = props.amount ?? fixedTransaction.amount;
    if (amount === null || amount === undefined)
      throw new Error('An amount is required for this fixed transaction');
    if (amount <= 0) throw new Error('Amount must be a positive number');

    return await this.transactionsRepo.create({
      amount,
      currency: props.currency ?? fixedTransaction.currency,
      type: fixedTransaction.type,
      categoryId: fixedTransaction.category.id,
      dueDate: props.dueDate
        ? new Date(props.dueDate)
        : dateForDueDay(monthRange, fixedTransaction.dueDay),
      description: props.description ?? fixedTransaction.name,
      fixedTransactionId: fixedTransaction.id,
    });
  }
}
