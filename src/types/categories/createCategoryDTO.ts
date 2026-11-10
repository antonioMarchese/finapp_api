import { TransactionType } from '../transactions/transactionTypes';
import { CategoryIcon } from './categoryIcons';

export default interface CreateCategoryDTO {
  title: string;
  color: string | null;
  type?: TransactionType;
  icon?: CategoryIcon | null;
  active?: boolean;
  weeklyBudget?: number | null;
  excludeFromWeekly?: boolean;
}
