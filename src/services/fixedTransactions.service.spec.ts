import { Test, TestingModule } from '@nestjs/testing';
import { FixedTransactionsService } from './fixedTransactions.service';
import FixedTransactionsRepository from 'src/domain/repositories/fixedTransactions.repository';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import {
  InMemoFixedTransactionsRepository,
  inMemoFixedTransactions,
} from 'src/domain/repositories/memo/memo.fixedTransactions.repository';
import { InMemoSettingsRepository } from 'src/domain/repositories/memo/memo.settings.repository';
import { InMemoTransactionsRepository } from 'src/domain/repositories/memo/memo.transactions.repository';
import {
  inMemoCategories,
  inMemoTransactions,
} from 'src/domain/repositories/memo/memo.db';
import Category from 'src/domain/entities/category';
import CategoryDTO from 'src/types/categories/categoryDTO';

describe('FixedTransactionsService', () => {
  let service: FixedTransactionsService;

  const currentMonth = (() => {
    const now = new Date();
    return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
  })();

  const mockCategoriesRepository = {
    findById: jest.fn(async (id: number): Promise<CategoryDTO | null> => {
      const category = inMemoCategories.find((c) => c.getId() === id);
      if (!category) return await Promise.resolve(null);

      return await Promise.resolve({
        id: category.getId(),
        title: category.getTitle(),
        slug: category.getSlug(),
        color: category.getColor(),
        type: category.getType(),
        icon: category.getIcon(),
        active: category.isActive(),
        weeklyBudget: category.getWeeklyBudget(),
        excludeFromWeekly: category.isExcludedFromWeekly(),
        position: category.getPosition(),
        createdAt: category.getCreatedAt().toISOString(),
        updatedAt: category.getUpdatedAt().toISOString(),
      });
    }),
  };

  beforeEach(async () => {
    inMemoFixedTransactions.length = 0;
    inMemoTransactions.length = 0;
    inMemoCategories.length = 0;
    inMemoCategories.push(
      new Category(1, 'rent', 'Rent', '#EF4444', new Date(), new Date()),
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FixedTransactionsService,
        {
          provide: FixedTransactionsRepository,
          useValue: new InMemoFixedTransactionsRepository(),
        },
        { provide: CategoriesRepository, useValue: mockCategoriesRepository },
        {
          provide: TransactionsRepository,
          useValue: new InMemoTransactionsRepository(),
        },
        {
          provide: SettingsRepository,
          useValue: new InMemoSettingsRepository(),
        },
      ],
    }).compile();

    service = module.get<FixedTransactionsService>(FixedTransactionsService);
  });

  const createRent = async (overrides = {}) =>
    await service.create({
      name: 'Rent',
      categoryId: 1,
      amount: 1500,
      dueDay: 5,
      ...overrides,
    });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a fixed transaction defaulting to the configured currency', async () => {
    const fixedTransaction = await createRent();

    expect(fixedTransaction.name).toBe('Rent');
    expect(fixedTransaction.amount).toBe(1500);
    expect(fixedTransaction.currency).toBe('BRL');
    expect(fixedTransaction.type).toBe('expense');
    expect(fixedTransaction.active).toBe(true);
  });

  it('should allow a fixed transaction without an amount for variable bills', async () => {
    const fixedTransaction = await createRent({
      name: 'Electricity',
      amount: null,
    });

    expect(fixedTransaction.amount).toBeNull();
  });

  it('should reject an unknown category', async () => {
    await expect(createRent({ categoryId: 99 })).rejects.toThrow(
      'Invalid category',
    );
  });

  it('should reject an out-of-range due day', async () => {
    await expect(createRent({ dueDay: 45 })).rejects.toThrow(
      'Due day must be a whole number between 1 and 31',
    );
  });

  it('should reject an empty name', async () => {
    await expect(createRent({ name: '   ' })).rejects.toThrow(
      'Name is required',
    );
  });

  it('should report the bill as unpaid before it is paid', async () => {
    await createRent();
    const [fixedTransaction] = await service.findAll(currentMonth);

    expect(fixedTransaction.currentPayment).toBeNull();
  });

  it('should generate a transaction from the template and mark it paid', async () => {
    const created = await createRent();
    const transaction = await service.pay(created.id, {}, currentMonth);

    expect(transaction.amount).toBe(1500);
    expect(transaction.currency).toBe('BRL');
    expect(transaction.type).toBe('expense');
    expect(transaction.description).toBe('Rent');
    expect(transaction.fixedTransactionId).toBe(created.id);
    // The generated transaction lands on the template's due day.
    expect(new Date(transaction.dueDate).getUTCDate()).toBe(5);

    const [fixedTransaction] = await service.findAll(currentMonth);
    expect(fixedTransaction.currentPayment).not.toBeNull();
    expect(fixedTransaction.currentPayment?.amount).toBe(1500);
  });

  it('should let the caller override the amount for a variable bill', async () => {
    const created = await createRent({ name: 'Electricity', amount: null });
    const transaction = await service.pay(
      created.id,
      { amount: 237.4 },
      currentMonth,
    );

    expect(transaction.amount).toBe(237.4);
  });

  it('should refuse to pay a variable bill with no amount supplied', async () => {
    const created = await createRent({ name: 'Electricity', amount: null });

    await expect(service.pay(created.id, {}, currentMonth)).rejects.toThrow(
      'An amount is required for this fixed transaction',
    );
  });

  it('should refuse to pay the same bill twice in one month', async () => {
    const created = await createRent();
    await service.pay(created.id, {}, currentMonth);

    await expect(service.pay(created.id, {}, currentMonth)).rejects.toThrow(
      'This fixed transaction was already paid for this month',
    );
  });

  it('should still treat the bill as unpaid in a different month', async () => {
    const created = await createRent();
    await service.pay(created.id, {}, '2020-01');

    const [fixedTransaction] = await service.findAll('2020-02');
    expect(fixedTransaction.currentPayment).toBeNull();
  });

  it('should update a fixed transaction', async () => {
    const created = await createRent();
    const updated = await service.update(created.id, {
      name: 'Rent (new flat)',
      amount: 1800,
      currency: 'USD',
    });

    expect(updated.name).toBe('Rent (new flat)');
    expect(updated.amount).toBe(1800);
    expect(updated.currency).toBe('USD');
  });

  it('should clear the amount when explicitly set to null', async () => {
    const created = await createRent();
    const updated = await service.update(created.id, { amount: null });

    expect(updated.amount).toBeNull();
  });

  it('should remove a fixed transaction', async () => {
    const created = await createRent();
    await service.remove(created.id);

    expect(await service.findAll(currentMonth)).toHaveLength(0);
  });

  it('should throw when updating or removing an unknown fixed transaction', async () => {
    await expect(service.update(404, { name: 'Nope' })).rejects.toThrow(
      'Fixed transaction not found',
    );
    await expect(service.remove(404)).rejects.toThrow(
      'Fixed transaction not found',
    );
  });
});
