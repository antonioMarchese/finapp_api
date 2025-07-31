export default interface PaginatedResponse<T> {
  page: number;
  next: number | null;
  prev: number | null;
  count: number;
  results: T[];
}
