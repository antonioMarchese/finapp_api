import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { FixedTransactionsService } from 'src/services/fixedTransactions.service';
import CreateFixedTransactionDTO from 'src/types/fixedTransactions/createFixedTransactionDTO';
import FixedTransactionDTO from 'src/types/fixedTransactions/fixedTransactionDTO';
import PayFixedTransactionDTO from 'src/types/fixedTransactions/payFixedTransactionDTO';
import UpdateFixedTransactionDTO from 'src/types/fixedTransactions/updateFixedTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';

@Controller()
export class FixedTransactionsController {
  constructor(
    private readonly fixedTransactionsService: FixedTransactionsService,
  ) {}

  // `month` is "YYYY-MM" and defaults to the current month; it decides which
  // month the paid/unpaid state is reported for.
  @Get('fixed-transactions')
  async findAll(
    @Query('month') month?: string,
  ): Promise<FixedTransactionDTO[]> {
    return await this.fixedTransactionsService.findAll(month);
  }

  @Get('fixed-transactions/:id')
  async findById(
    @Param('id') id: string,
    @Query('month') month?: string,
  ): Promise<FixedTransactionDTO> {
    const fixedTransaction = await this.fixedTransactionsService.findById(
      Number(id),
      month,
    );
    if (!fixedTransaction)
      throw new NotFoundException('Fixed transaction not found');

    return fixedTransaction;
  }

  @Post('fixed-transactions')
  async create(
    @Body() props: CreateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    return await this.handle(
      () => this.fixedTransactionsService.create(props),
      'Error creating fixed transaction',
    );
  }

  @Put('fixed-transactions/:id')
  async update(
    @Param('id') id: string,
    @Body() props: UpdateFixedTransactionDTO,
  ): Promise<FixedTransactionDTO> {
    return await this.handle(
      () => this.fixedTransactionsService.update(Number(id), props),
      'Error updating fixed transaction',
    );
  }

  @Delete('fixed-transactions/:id')
  async remove(@Param('id') id: string): Promise<null> {
    return await this.handle(
      () => this.fixedTransactionsService.remove(Number(id)),
      'Error removing fixed transaction',
    );
  }

  @Post('fixed-transactions/:id/pay')
  async pay(
    @Param('id') id: string,
    @Body() props: PayFixedTransactionDTO,
    @Query('month') month?: string,
  ): Promise<TransactionDTO> {
    return await this.handle(
      () => this.fixedTransactionsService.pay(Number(id), props ?? {}, month),
      'Error paying fixed transaction',
    );
  }

  // NotFound is passed through untouched; everything else becomes a 400
  // carrying the service's message, matching the other controllers.
  private async handle<T>(action: () => Promise<T>, fallback: string) {
    try {
      return await action();
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      let message: string = fallback;
      if (error instanceof Error) message = error.message;

      throw new HttpException(
        { status: 400, error: message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
