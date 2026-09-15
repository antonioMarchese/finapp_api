import { ByCurrency } from '../currency';

export interface CategoryMonthlyTotals {
  [categoryId: number]: {
    title: string;
    color: string | null;
    reports: {
      [month: string]: number;
    };
  };
}

// Grouped by currency: totals are never converted or combined across currencies.
type MonthlyCategoryTotalsDTO = ByCurrency<CategoryMonthlyTotals>;

export default MonthlyCategoryTotalsDTO;
