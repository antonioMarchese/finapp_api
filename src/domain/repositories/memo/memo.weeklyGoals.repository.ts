import { Currency } from 'src/types/currency';
import UpdateWeeklyGoalsDTO from 'src/types/weeklyGoals/updateWeeklyGoalsDTO';
import WeeklyGoalsDTO from 'src/types/weeklyGoals/weeklyGoalsDTO';
import WeeklyGoalsRepository from '../weeklyGoals.repository';
import { inMemoCategories } from './memo.db';

interface InMemoWeeklyGoals {
  id: number;
  currency: Currency;
  spendingLimit: number | null;
  showDailyBudget: boolean;
  savingsTarget: number | null;
  noSpendDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoWeeklyGoalsRepository extends WeeklyGoalsRepository<InMemoWeeklyGoals> {
  private goals: InMemoWeeklyGoals | null = null;

  private ensure(defaultCurrency: Currency): InMemoWeeklyGoals {
    this.goals ??= {
      id: 1,
      currency: defaultCurrency,
      spendingLimit: null,
      showDailyBudget: true,
      savingsTarget: null,
      noSpendDays: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return this.goals;
  }

  async get(defaultCurrency: Currency): Promise<WeeklyGoalsDTO> {
    return await Promise.resolve(this.toDTO(this.ensure(defaultCurrency)));
  }

  async update(
    { categoryBudgets = [], ...props }: UpdateWeeklyGoalsDTO,
    defaultCurrency: Currency,
  ): Promise<WeeklyGoalsDTO> {
    const current = this.ensure(defaultCurrency);
    this.goals = {
      ...current,
      currency: props.currency ?? current.currency,
      spendingLimit:
        props.spendingLimit !== undefined
          ? props.spendingLimit
          : current.spendingLimit,
      showDailyBudget: props.showDailyBudget ?? current.showDailyBudget,
      savingsTarget:
        props.savingsTarget !== undefined
          ? props.savingsTarget
          : current.savingsTarget,
      noSpendDays: props.noSpendDays ?? current.noSpendDays,
      updatedAt: new Date(),
    };

    categoryBudgets.forEach(({ categoryId, weeklyBudget }) =>
      inMemoCategories
        .find((category) => category.getId() === categoryId)
        ?.setWeeklyBudget(weeklyBudget),
    );

    return await Promise.resolve(this.toDTO(this.goals));
  }

  toDTO(goals: InMemoWeeklyGoals): WeeklyGoalsDTO {
    return {
      id: goals.id,
      currency: goals.currency,
      spendingLimit: goals.spendingLimit,
      showDailyBudget: goals.showDailyBudget,
      savingsTarget: goals.savingsTarget,
      noSpendDays: goals.noSpendDays,
      createdAt: goals.createdAt.toISOString(),
      updatedAt: goals.updatedAt.toISOString(),
    };
  }
}
