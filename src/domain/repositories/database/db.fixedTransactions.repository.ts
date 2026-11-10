import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import CreateFixedTransactionDTO from 'src/types/fixedTransactions/createFixedTransactionDTO';
import FixedTransactionDTO from 'src/types/fixedTransactions/fixedTransactionDTO';
import UpdateFixedTransactionDTO from 'src/types/fixedTransactions/updateFixedTransactionDTO';
import FixedTransactionsRepository, { MonthRange } from '../fixedTransactions.repository';

// The template joined with its category and the payments falling inside the
// month being inspected — the raw shape toDTO folds into the DTO.
type FixedTransactionRow = {
  id: number;
  name: string;
  amount: number | null;
  currency: FixedTransactionDTO['currency'];
  type: FixedTransactionDTO['type'];
  dueDay: number | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  category: { id: number; title: string; color: string | null };
  transactions: { id: number; amount: number; dueDate: Date }[];
};

@Injectable()
export class DBFixedTransactionsRepository extends FixedTransactionsRepository<FixedTransactionRow> {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  private include(month: MonthRange) {
    return {
      category: {
        select: { id: true, title: true, color: true },
      },
      transactions: {
        where: {
          dueDate: { gte: month.start, lte: month.end },
        },
        select: { id: true, amount: true, dueDate: true },
        orderBy: { dueDate: 'desc' as const },
        take: 1,
      },
    };
  }

  async findAll(month: MonthRange): Promise<FixedTransactionDTO[]> {
    const fixedTransactions =
      await this.prismaService.fixedTransaction.findMany({
        include: this.include(month),
        orderBy: [{ active: 'desc' }, { dueDay: 'asc' }, { name: 'asc' }],
      });

    return await Promise.resolve(
      fixedTransactions.map((f) => this.toDTO(f as FixedTransactionRow)),
    );
  }

  async findById(
    id: number,
    month: MonthRange,
  ): Promise<FixedTransactionDTO | null> {
    const fixedTransaction =
      await this.prismaService.fixedTransaction.findUnique({
        where: { id },
        include: this.include(month),
      });

    if (!fixedTransaction) return await Promise.resolve(null);

    return await Promise.resolve(
      this.toDTO(fixedTransaction as FixedTransactionRow),
    );
  }

  async create(
    props: CreateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    const created = await this.prismaService.fixedTransaction.create({
      data: {
        name: props.name,
        categoryId: props.categoryId,
        amount: props.amount ?? null,
        currency: props.currency,
        type: props.type,
        dueDay: props.dueDay ?? null,
        active: props.active ?? true,
      },
      include: this.include(this.emptyMonth()),
    });

    return await Promise.resolve(this.toDTO(created as FixedTransactionRow));
  }

  async update(
    id: number,
    props: UpdateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    const updated = await this.prismaService.fixedTransaction.update({
      where: { id },
      data: {
        name: props.name,
        categoryId: props.categoryId,
        // `null` is meaningful here: it turns a fixed-value bill into a
        // variable one, so it must not be collapsed into "unchanged".
        amount: props.amount === undefined ? undefined : props.amount,
        currency: props.currency,
        type: props.type,
        dueDay: props.dueDay === undefined ? undefined : props.dueDay,
        active: props.active,
      },
      include: this.include(this.emptyMonth()),
    });

    return await Promise.resolve(this.toDTO(updated as FixedTransactionRow));
  }

  async remove(id: number): Promise<null> {
    await this.prismaService.fixedTransaction.delete({ where: { id } });

    return await Promise.resolve(null);
  }

  // Writes return the template itself, not a monthly view, so the payment
  // lookup is scoped to an empty range.
  private emptyMonth(): MonthRange {
    const epoch = new Date(0);
    return { start: epoch, end: epoch };
  }

  toDTO(fixedTransaction: FixedTransactionRow): FixedTransactionDTO {
    const payment = fixedTransaction.transactions?.[0];

    return {
      id: fixedTransaction.id,
      name: fixedTransaction.name,
      amount: fixedTransaction.amount,
      currency: fixedTransaction.currency,
      type: fixedTransaction.type,
      dueDay: fixedTransaction.dueDay,
      active: fixedTransaction.active,
      category: {
        id: fixedTransaction.category.id,
        title: fixedTransaction.category.title,
        color: fixedTransaction.category.color ?? undefined,
      },
      currentPayment: payment
        ? { id: payment.id, amount: payment.amount, dueDate: payment.dueDate }
        : null,
      createdAt: fixedTransaction.createdAt,
      updatedAt: fixedTransaction.updatedAt,
    };
  }
}
