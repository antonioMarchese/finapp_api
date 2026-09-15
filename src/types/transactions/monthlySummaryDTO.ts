import { ByCurrency } from '../currency';

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export type MonthlySummaryByMonth = Record<string, MonthlySummary>;

// Grouped by currency: each currency keeps its own month-by-month series.
type MonthlySummaryDTO = ByCurrency<MonthlySummaryByMonth>;

export default MonthlySummaryDTO;
