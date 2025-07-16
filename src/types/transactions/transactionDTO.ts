import CreateTransactionDTO from './createTransactionDTO';

export default interface TransactionDTO
  extends Omit<CreateTransactionDTO, 'categoryId'> {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  category: {
    id: number;
    title: string;
    color?: string;
  };
}
