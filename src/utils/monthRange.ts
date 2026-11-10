import { MonthRange } from 'src/domain/repositories/fixedTransactions.repository';

// Accepts "YYYY-MM"; anything missing or malformed falls back to the current
// month, so the checklist always has a well-defined window.
export function resolveMonthRange(month?: string): MonthRange {
  const now = new Date();
  let year = now.getUTCFullYear();
  let monthIndex = now.getUTCMonth();

  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [rawYear, rawMonth] = month.split('-').map(Number);
    if (rawMonth >= 1 && rawMonth <= 12) {
      year = rawYear;
      monthIndex = rawMonth - 1;
    }
  }

  return {
    start: new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, monthIndex + 1, 0, 23, 59, 59, 999)),
  };
}

// Dates the generated transaction on the template's due day, clamped to the
// length of the month so day 31 still works in February.
export function dateForDueDay(month: MonthRange, dueDay?: number | null): Date {
  const year = month.start.getUTCFullYear();
  const monthIndex = month.start.getUTCMonth();
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
  const day = dueDay ? Math.min(Math.max(dueDay, 1), lastDay) : 1;

  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0, 0));
}
