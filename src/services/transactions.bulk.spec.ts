import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import { InMemoTransactionsRepository } from 'src/domain/repositories/memo/memo.transactions.repository';
import { InMemoCategoriesRepository } from 'src/domain/repositories/memo/memo.categories.repository';
import { InMemoSettingsRepository } from 'src/domain/repositories/memo/memo.settings.repository';
import {
  inMemoCategories,
  inMemoTransactions,
} from 'src/domain/repositories/memo/memo.db';

describe('TransactionsService bulk actions', () => {
  let service: TransactionsService;
  let categories: InMemoCategoriesRepository;
  let ids: number[];
  let foodId: number;
  let busId: number;

  beforeEach(async () => {
    inMemoCategories.length = 0;
    inMemoTransactions.length = 0;
    categories = new InMemoCategoriesRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: new InMemoTransactionsRepository(),
        },
        { provide: CategoriesRepository, useValue: categories },
        {
          provide: SettingsRepository,
          useValue: new InMemoSettingsRepository(),
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
    foodId = (await categories.create({ title: 'Food', color: null })).id;
    busId = (await categories.create({ title: 'Bus', color: null })).id;

    ids = [];
    for (const amount of [10, 20, 30]) {
      const transaction = await service.create({
        amount,
        dueDate: new Date(2026, 10, 2),
        type: 'expense',
        categoryId: foodId,
      });
      ids.push(transaction.id);
    }
  });

  it('should delete a single transaction', async () => {
    await service.remove(ids[0]);

    expect(await service.findById(ids[0])).toBeNull();
    expect(inMemoTransactions).toHaveLength(2);
  });

  it('should delete only the selected transactions', async () => {
    expect(await service.removeMany([ids[0], ids[2]])).toBe(2);

    expect(inMemoTransactions.map((t) => t.getId())).toEqual([ids[1]]);
  });

  it('should move the selected transactions to another category', async () => {
    expect(await service.updateCategoryMany([ids[0], ids[1]], busId)).toBe(2);

    expect(inMemoTransactions.map((t) => t.getCategoryId())).toEqual([
      busId,
      busId,
      foodId,
    ]);
  });

  it('should count repeated ids once', async () => {
    expect(await service.removeMany([ids[0], ids[0]])).toBe(1);
  });

  it('should change nothing when any selected transaction is gone', async () => {
    await expect(service.removeMany([ids[0], 999])).rejects.toThrow(
      'Some transactions no longer exist',
    );
    expect(inMemoTransactions).toHaveLength(3);
  });

  it.each([[[]], [[0]], [[1.5]], ['1' as never]])(
    'should reject the selection %p',
    async (selection) => {
      await expect(service.removeMany(selection)).rejects.toThrow(
        'Select at least one transaction',
      );
    },
  );

  it('should reject an unknown category', async () => {
    await expect(service.updateCategoryMany([ids[0]], 999)).rejects.toThrow(
      'Invalid category',
    );
  });
});
