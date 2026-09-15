import CreateFixedTransactionDTO from 'src/types/fixedTransactions/createFixedTransactionDTO';
import FixedTransactionDTO from 'src/types/fixedTransactions/fixedTransactionDTO';
import UpdateFixedTransactionDTO from 'src/types/fixedTransactions/updateFixedTransactionDTO';
import FixedTransactionsRepository, {
  MonthRange,
} from '../fixedTransactions.repository';
import { Currency, DEFAULT_CURRENCY } from 'src/types/currency';
import { TransactionType } from 'src/types/transactions/transactionTypes';
import { inMemoCategories, inMemoTransactions } from './memo.db';

export interface InMemoFixedTransaction {
  id: number;
  name: string;
  amount: number | null;
  currency: Currency;
  type: TransactionType;
  dueDay: number | null;
  active: boolean;
  categoryId: number;
  createdAt: Date;
  updatedAt: Date;
}

export const inMemoFixedTransactions: InMemoFixedTransaction[] = [];

export class InMemoFixedTransactionsRepository extends FixedTransactionsRepository<InMemoFixedTransaction> {
  private lastId: number = 1;
  private month: MonthRange = { start: new Date(0), end: new Date(0) };

  async findAll(month: MonthRange): Promise<FixedTransactionDTO[]> {
    this.month = month;

    return await Promise.resolve(
      inMemoFixedTransactions.map((f) => this.toDTO(f)),
    );
  }

  async findById(
    id: number,
    month: MonthRange,
  ): Promise<FixedTransactionDTO | null> {
    this.month = month;
    const fixedTransaction = inMemoFixedTransactions.find((f) => f.id === id);

    if (!fixedTransaction) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(fixedTransaction));
  }

  async create(props: CreateFixedTransactionDTO): Promise<FixedTransactionDTO> {
    const fixedTransaction: InMemoFixedTransaction = {
      id: this.lastId,
      name: props.name,
      amount: props.amount ?? null,
      currency: props.currency ?? DEFAULT_CURRENCY,
      type: props.type ?? 'expense',
      dueDay: props.dueDay ?? null,
      active: props.active ?? true,
      categoryId: props.categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    inMemoFixedTransactions.push(fixedTransaction);
    this.lastId++;

    return await Promise.resolve(this.toDTO(fixedTransaction));
  }

  async update(
    id: number,
    props: UpdateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    const fixedTransaction = inMemoFixedTransactions.find((f) => f.id === id)!;

    fixedTransaction.name = props.name ?? fixedTransaction.name;
    fixedTransaction.categoryId = props.categoryId ?? fixedTransaction.categoryId;
    // `null` clears the fixed value; only `undefined` means "leave as is".
    if (props.amount !== undefined) fixedTransaction.amount = props.amount;
    if (props.dueDay !== undefined) fixedTransaction.dueDay = props.dueDay;
    fixedTransaction.currency = props.currency ?? fixedTransaction.currency;
    fixedTransaction.type = props.type ?? fixedTransaction.type;
    fixedTransaction.active = props.active ?? fixedTransaction.active;
    fixedTransaction.updatedAt = new Date();

    return await Promise.resolve(this.toDTO(fixedTransaction));
  }

  async remove(id: number): Promise<null> {
    const index = inMemoFixedTransactions.findIndex((f) => f.id === id);
    if (index >= 0) inMemoFixedTransactions.splice(index, 1);

    return await Promise.resolve(null);
  }

  toDTO(fixedTransaction: InMemoFixedTransaction): FixedTransactionDTO {
    const category = inMemoCategories.find(
      (c) => c.getId() === fixedTransaction.categoryId,
    );

    const payment = inMemoTransactions.find((t) => {
      if (t.getFixedTransactionId() !== fixedTransaction.id) return false;
      const dueDate = new Date(t.getDueDate());
      return dueDate >= this.month.start && dueDate <= this.month.end;
    });

    return {
      id: fixedTransaction.id,
      name: fixedTransaction.name,
      amount: fixedTransaction.amount,
      currency: fixedTransaction.currency,
      type: fixedTransaction.type,
      dueDay: fixedTransaction.dueDay,
      active: fixedTransaction.active,
      category: {
        id: category?.getId() ?? fixedTransaction.categoryId,
        title: category?.getTitle() ?? '',
        color: category?.getColor(),
      },
      currentPayment: payment
        ? {
            id: payment.getId(),
            amount: payment.getAmount(),
            dueDate: payment.getDueDate(),
          }
        : null,
      createdAt: fixedTransaction.createdAt,
      updatedAt: fixedTransaction.updatedAt,
    };
  }
}
