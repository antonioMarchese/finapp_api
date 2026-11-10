import { ByCurrency } from '../currency';

type AmountByCategory = Record<string, number>;

export interface TypedAmountByCategory {
  income: AmountByCategory;
  expense: AmountByCategory;
  investment: AmountByCategory;
}

// Grouped by currency: amounts in different currencies are never summed.
type AmountByCategoryResponse = ByCurrency<TypedAmountByCategory>;

export default AmountByCategoryResponse;
