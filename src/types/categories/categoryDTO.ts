import { TransactionType } from '../transactions/transactionTypes';
import { CategoryIcon } from './categoryIcons';

export default interface CategoryDTO {
  id: number;
  title: string;
  slug: string;
  color: string | null;
  type: TransactionType;
  icon: CategoryIcon | null;
  active: boolean;
  // In the weekly goals' currency; null means no cap.
  weeklyBudget: number | null;
  // Left out of the weekly view and its goals.
  excludeFromWeekly: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}
