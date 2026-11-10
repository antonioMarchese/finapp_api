import { Currency } from '../currency';

export interface CategoryBudgetDTO {
  categoryId: number;
  weeklyBudget: number | null;
}

// Fields left out stay as they are; null clears an amount.
export default interface UpdateWeeklyGoalsDTO {
  currency?: Currency;
  spendingLimit?: number | null;
  showDailyBudget?: boolean;
  savingsTarget?: number | null;
  noSpendDays?: number;
  // Saved together with the goals, as the goals dialog edits both at once.
  categoryBudgets?: CategoryBudgetDTO[];
}
