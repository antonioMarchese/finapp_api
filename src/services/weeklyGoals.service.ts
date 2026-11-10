import { Injectable } from '@nestjs/common';
import { AppSettings, Category, WeeklyGoals } from 'generated/prisma';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import WeeklyGoalsRepository from 'src/domain/repositories/weeklyGoals.repository';
import { isCurrency } from 'src/types/currency';
import UpdateWeeklyGoalsDTO from 'src/types/weeklyGoals/updateWeeklyGoalsDTO';
import WeeklyGoalsDTO from 'src/types/weeklyGoals/weeklyGoalsDTO';
import { isValidBudget } from './categories.service';

const isPositiveOrNull = (value: unknown) =>
  value === null ||
  (typeof value === 'number' && Number.isFinite(value) && value > 0);

@Injectable()
export class WeeklyGoalsService {
  constructor(
    private readonly repository: WeeklyGoalsRepository<WeeklyGoals>,
    private readonly settingsRepo: SettingsRepository<AppSettings>,
    private readonly categoriesRepo: CategoriesRepository<Category>,
  ) {}

  // Goals start out in whatever currency the app defaults to.
  private async defaultCurrency() {
    return (await this.settingsRepo.get()).defaultCurrency;
  }

  async get(): Promise<WeeklyGoalsDTO> {
    return await this.repository.get(await this.defaultCurrency());
  }

  async update(props: UpdateWeeklyGoalsDTO): Promise<WeeklyGoalsDTO> {
    if (props.currency !== undefined && !isCurrency(props.currency))
      throw new Error('Invalid currency');
    if (
      props.spendingLimit !== undefined &&
      !isPositiveOrNull(props.spendingLimit)
    )
      throw new Error('Spending limit must be empty or a positive amount');
    if (
      props.savingsTarget !== undefined &&
      !isPositiveOrNull(props.savingsTarget)
    )
      throw new Error('Savings target must be empty or a positive amount');
    if (
      props.showDailyBudget !== undefined &&
      typeof props.showDailyBudget !== 'boolean'
    )
      throw new Error('Show daily budget must be true or false');
    if (
      props.noSpendDays !== undefined &&
      !(
        Number.isInteger(props.noSpendDays) &&
        props.noSpendDays >= 0 &&
        props.noSpendDays <= 7
      )
    )
      throw new Error('No-spend days must be a whole number from 0 to 7');

    if (props.categoryBudgets !== undefined) {
      if (!Array.isArray(props.categoryBudgets))
        throw new Error('Category budgets must be a list');

      const categories = await this.categoriesRepo.findAll();
      const known = new Set(categories.map((category) => category.id));
      for (const { categoryId, weeklyBudget } of props.categoryBudgets) {
        if (!known.has(categoryId)) throw new Error('Category not found');
        if (!isValidBudget(weeklyBudget))
          throw new Error('Weekly budget must be empty or a positive amount');
      }
    }

    return await this.repository.update(props, await this.defaultCurrency());
  }
}
