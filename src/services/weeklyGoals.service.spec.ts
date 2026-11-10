import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyGoalsService } from './weeklyGoals.service';
import { CategoriesService } from './categories.service';
import WeeklyGoalsRepository from 'src/domain/repositories/weeklyGoals.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { InMemoWeeklyGoalsRepository } from 'src/domain/repositories/memo/memo.weeklyGoals.repository';
import { InMemoSettingsRepository } from 'src/domain/repositories/memo/memo.settings.repository';
import { InMemoCategoriesRepository } from 'src/domain/repositories/memo/memo.categories.repository';
import { inMemoCategories } from 'src/domain/repositories/memo/memo.db';

describe('WeeklyGoalsService', () => {
  let service: WeeklyGoalsService;
  let categoriesService: CategoriesService;
  let settingsRepo: InMemoSettingsRepository;

  beforeEach(async () => {
    inMemoCategories.length = 0;
    settingsRepo = new InMemoSettingsRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeklyGoalsService,
        CategoriesService,
        {
          provide: WeeklyGoalsRepository,
          useValue: new InMemoWeeklyGoalsRepository(),
        },
        { provide: SettingsRepository, useValue: settingsRepo },
        {
          provide: CategoriesRepository,
          useValue: new InMemoCategoriesRepository(),
        },
      ],
    }).compile();

    service = module.get<WeeklyGoalsService>(WeeklyGoalsService);
    categoriesService = module.get<CategoriesService>(CategoriesService);
  });

  it('should start with no goals in the default currency', async () => {
    await settingsRepo.update({ defaultCurrency: 'EUR' });

    expect(await service.get()).toMatchObject({
      currency: 'EUR',
      spendingLimit: null,
      showDailyBudget: true,
      savingsTarget: null,
      noSpendDays: 0,
    });
  });

  it('should update only the fields sent', async () => {
    await service.update({ spendingLimit: 250, savingsTarget: 75 });
    const goals = await service.update({ noSpendDays: 2 });

    expect(goals).toMatchObject({
      spendingLimit: 250,
      savingsTarget: 75,
      noSpendDays: 2,
    });
  });

  it('should clear an amount with null', async () => {
    await service.update({ spendingLimit: 250 });

    expect(
      (await service.update({ spendingLimit: null })).spendingLimit,
    ).toBeNull();
  });

  it('should save category budgets together with the goals', async () => {
    const food = await categoriesService.create({ title: 'Food', color: null });
    const bus = await categoriesService.create({ title: 'Bus', color: null });
    await categoriesService.update(bus.id, { weeklyBudget: 20 });

    await service.update({
      spendingLimit: 250,
      categoryBudgets: [
        { categoryId: food.id, weeklyBudget: 90 },
        { categoryId: bus.id, weeklyBudget: null },
      ],
    });

    expect((await categoriesService.findById(food.id))?.weeklyBudget).toBe(90);
    expect((await categoriesService.findById(bus.id))?.weeklyBudget).toBeNull();
  });

  it.each([
    [{ currency: 'JPY' as never }, 'Invalid currency'],
    [{ spendingLimit: 0 }, 'Spending limit must be empty or a positive amount'],
    [
      { spendingLimit: -5 },
      'Spending limit must be empty or a positive amount',
    ],
    [
      { savingsTarget: Number.NaN },
      'Savings target must be empty or a positive amount',
    ],
    [{ noSpendDays: 8 }, 'No-spend days must be a whole number from 0 to 7'],
    [{ noSpendDays: 1.5 }, 'No-spend days must be a whole number from 0 to 7'],
    [
      { showDailyBudget: 'yes' as never },
      'Show daily budget must be true or false',
    ],
  ])('should reject %p', async (props, message) => {
    await expect(service.update(props)).rejects.toThrow(message);
  });

  it('should reject budgets for unknown categories', async () => {
    await expect(
      service.update({
        categoryBudgets: [{ categoryId: 99, weeklyBudget: 10 }],
      }),
    ).rejects.toThrow('Category not found');
  });

  it('should reject negative category budgets', async () => {
    const food = await categoriesService.create({ title: 'Food', color: null });

    await expect(
      service.update({
        categoryBudgets: [{ categoryId: food.id, weeklyBudget: -1 }],
      }),
    ).rejects.toThrow('Weekly budget must be empty or a positive amount');
  });
});

describe('CategoriesService settings', () => {
  let service: CategoriesService;

  beforeEach(async () => {
    inMemoCategories.length = 0;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: new InMemoCategoriesRepository(),
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should create a category with type, icon and budget', async () => {
    expect(
      await service.create({
        title: 'Salary',
        color: '#10B981',
        type: 'income',
        icon: 'salary',
      }),
    ).toMatchObject({
      type: 'income',
      icon: 'salary',
      active: true,
      weeklyBudget: null,
    });
  });

  it('should change a single field without touching the rest', async () => {
    const food = await service.create({
      title: 'Food',
      color: '#EF4444',
      icon: 'utensils',
    });

    expect(await service.update(food.id, { active: false })).toMatchObject({
      title: 'Food',
      color: '#EF4444',
      icon: 'utensils',
      active: false,
    });
  });

  it.each([
    [{ type: 'transfer' as never }, 'Invalid category type'],
    [{ icon: 'rocket' as never }, 'Invalid category icon'],
    [{ weeklyBudget: -10 }, 'Weekly budget must be empty or a positive amount'],
    [{ title: '  ' }, 'Category title is required'],
  ])('should reject %p', async (props, message) => {
    const food = await service.create({ title: 'Food', color: null });

    await expect(service.update(food.id, props)).rejects.toThrow(message);
  });

  it('should list categories in the saved order', async () => {
    const a = await service.create({ title: 'A', color: null });
    const b = await service.create({ title: 'B', color: null });
    const c = await service.create({ title: 'C', color: null });

    const ordered = await service.reorder([c.id, a.id, b.id]);

    expect(ordered.map((category) => category.title)).toEqual(['C', 'A', 'B']);
    expect((await service.findAll()).map((category) => category.title)).toEqual(
      ['C', 'A', 'B'],
    );
  });

  it('should reject an order that misses or repeats a category', async () => {
    const a = await service.create({ title: 'A', color: null });
    const b = await service.create({ title: 'B', color: null });

    await expect(service.reorder([a.id])).rejects.toThrow(
      'The new order must list every category exactly once',
    );
    await expect(service.reorder([a.id, a.id])).rejects.toThrow(
      'The new order must list every category exactly once',
    );
    await expect(service.reorder([a.id, b.id, 99])).rejects.toThrow(
      'The new order must list every category exactly once',
    );
  });
});
