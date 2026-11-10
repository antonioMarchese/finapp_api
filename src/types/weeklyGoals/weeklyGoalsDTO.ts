import { Currency } from '../currency';

export default interface WeeklyGoalsDTO {
  id: number;
  // The limit, savings target and every category's weekly budget are in this
  // currency; only spending recorded in it counts toward the goals.
  currency: Currency;
  // null means no weekly limit is set.
  spendingLimit: number | null;
  // Show the limit split into a per-day budget.
  showDailyBudget: boolean;
  // Amount to move into investments each week; null means no savings goal.
  savingsTarget: number | null;
  // Days per week with no expenses to aim for; 0 means no such goal.
  noSpendDays: number;
  createdAt: string;
  updatedAt: string;
}
