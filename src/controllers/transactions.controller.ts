import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { TransactionsService } from 'src/services/transactions.service';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

@Controller()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get('transactions')
  async findAll(): Promise<TransactionDTO[]> {
    return await this.transactionsService.findAll();
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
}
