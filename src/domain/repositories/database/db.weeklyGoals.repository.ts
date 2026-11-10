import { Injectable } from '@nestjs/common';
import { WeeklyGoals } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma.service';
import { Currency } from 'src/types/currency';
import UpdateWeeklyGoalsDTO from 'src/types/weeklyGoals/updateWeeklyGoalsDTO';
import WeeklyGoalsDTO from 'src/types/weeklyGoals/weeklyGoalsDTO';
import WeeklyGoalsRepository from '../weeklyGoals.repository';

// The weekly goals table holds exactly one row, pinned to this id.
const WEEKLY_GOALS_ID = 1;

@Injectable()
export class DBWeeklyGoalsRepository extends WeeklyGoalsRepository<WeeklyGoals> {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async get(defaultCurrency: Currency): Promise<WeeklyGoalsDTO> {
    const goals = await this.prismaService.weeklyGoals.upsert({
      where: { id: WEEKLY_GOALS_ID },
      update: {},
      create: { id: WEEKLY_GOALS_ID, currency: defaultCurrency },
    });

    return await Promise.resolve(this.toDTO(goals));
  }

  async update(
    { categoryBudgets = [], ...props }: UpdateWeeklyGoalsDTO,
    defaultCurrency: Currency,
  ): Promise<WeeklyGoalsDTO> {
    const [goals] = await this.prismaService.$transaction([
      this.prismaService.weeklyGoals.upsert({
        where: { id: WEEKLY_GOALS_ID },
        update: { ...props },
        create: {
          id: WEEKLY_GOALS_ID,
          currency: defaultCurrency,
          ...props,
        },
      }),
      ...categoryBudgets.map(({ categoryId, weeklyBudget }) =>
        this.prismaService.category.update({
          where: { id: categoryId },
          data: { weeklyBudget },
        }),
      ),
    ]);

    return await Promise.resolve(this.toDTO(goals));
  }

  toDTO(goals: WeeklyGoals): WeeklyGoalsDTO {
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
