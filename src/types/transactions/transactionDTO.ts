import CreateTransactionDTO from './createTransactionDTO';

export default interface TransactionDTO extends CreateTransactionDTO {
  id: number;
  createdAt: Date;
  updatedAt: Date;
}
