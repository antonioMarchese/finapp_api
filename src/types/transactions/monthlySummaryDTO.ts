export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

type MonthlySummaryDTO = Record<string, MonthlySummary>;

export default MonthlySummaryDTO;
