export interface BulkDeleteTransactionsDTO {
  ids: number[];
}

export interface BulkUpdateCategoryDTO {
  ids: number[];
  categoryId: number;
}

export interface BulkResultDTO {
  // How many transactions were changed.
  count: number;
}
