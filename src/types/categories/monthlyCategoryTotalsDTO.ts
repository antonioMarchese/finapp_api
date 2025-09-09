export default interface MonthlyCategoryTotalsDTO {
  [categoryId: number]: {
    title: string;
    color: string | null;
    reports: {
      [month: string]: number;
    };
  };
}
