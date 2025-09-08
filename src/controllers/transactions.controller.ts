import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TransactionsService } from 'src/services/transactions.service';
import TypedAmountByCategory from 'src/types/transactions/amountByCategory';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import TransactionPaginatedResponse from 'src/types/transactions/transactionPaginatedResponse';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('transactions')
  async findAll(
    @Query() filters?: TransactionFilter,
  ): Promise<TransactionDTO[] | TransactionPaginatedResponse> {
    return await this.transactionsService.findAll(filters);
  }

  @Get('transactions/:id')
  async findById(@Param('id') id: string): Promise<TransactionDTO> {
    const transaction = await this.transactionsService.findById(Number(id));

    if (!transaction) throw new NotFoundException('Transaction not found');

    return transaction;
  }

  @Post('transactions')
  async create(@Body() props: CreateTransactionDTO): Promise<TransactionDTO> {
    return await this.transactionsService.create(props);
  }

  @Put('transactions/:id')
  async update(
    @Param('id') id: string,
    @Body() props: UpdateTransactionDTO,
  ): Promise<TransactionDTO | null> {
    return await this.transactionsService.update(Number(id), props);
  }

  @Get('categories-amount')
  async getAmountByCategory(
    @Query() filters?: TransactionFilter,
  ): Promise<TypedAmountByCategory> {
    return await this.transactionsService.getAmountByCategory(filters);
  }
}
