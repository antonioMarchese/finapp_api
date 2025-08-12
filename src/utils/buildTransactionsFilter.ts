import Transaction from 'src/domain/entities/transaction';

interface HashMapper {
  startDate: (transaction: Transaction, value: string) => boolean;
  endDate: (transaction: Transaction, value: string) => boolean;
  type: (transaction: Transaction, value: string) => boolean;
  categoryId: (transaction: Transaction, value: string) => boolean;
}

export default function buildInMemoTransactionFilter<
  key extends keyof HashMapper,
>(key: string) {
  const hashMapper: HashMapper = {
    startDate: (transaction: Transaction, value: string) => {
      const transactionDate = new Date(transaction.getDueDate());
      const filterDate = new Date(value);

      transactionDate.setUTCHours(0, 0, 0, 0);
      return transactionDate >= filterDate;
    },
    endDate: (transaction: Transaction, value: string) => {
      const transactionDate = new Date(transaction.getDueDate());
      const filterDate = new Date(value);

      transactionDate.setUTCHours(0, 0, 0, 0);
      return transactionDate <= filterDate;
    },
    type: (transaction: Transaction, value: string) => {
      return transaction.getType() === value;
    },
    categoryId: (transaction: Transaction, value: string) => {
      return transaction.getCategoryId() === Number(value);
    },
  };

  return hashMapper[key as keyof HashMapper];
}
