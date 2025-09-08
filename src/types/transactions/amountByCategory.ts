type AmountByCategory = Record<string, number>;

export default interface TypedAmountByCategory {
  income: AmountByCategory;
  expense: AmountByCategory;
  investment: AmountByCategory;
}
