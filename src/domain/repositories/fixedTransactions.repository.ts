import CreateFixedTransactionDTO from 'src/types/fixedTransactions/createFixedTransactionDTO';
import FixedTransactionDTO from 'src/types/fixedTransactions/fixedTransactionDTO';
import UpdateFixedTransactionDTO from 'src/types/fixedTransactions/updateFixedTransactionDTO';

export interface MonthRange {
  start: Date;
  end: Date;
}

export default abstract class FixedTransactionsRepository<Entity> {
  abstract create(
    props: CreateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO>;
  abstract update(
    id: number,
    props: UpdateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO>;
  abstract remove(id: number): Promise<null>;

  // `month` scopes the currentPayment lookup, which is what tells the UI
  // whether each bill has already been paid in the month being viewed.
  abstract findAll(month: MonthRange): Promise<FixedTransactionDTO[]>;
  abstract findById(
    id: number,
    month: MonthRange,
  ): Promise<FixedTransactionDTO | null>;

  abstract toDTO(fixedTransaction: Entity): FixedTransactionDTO;
}
