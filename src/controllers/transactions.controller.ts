import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { TransactionsService } from 'src/services/transactions.service';
import AmountByCategoryResponse from 'src/types/transactions/amountByCategory';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import MonthlySummaryDTO from 'src/types/transactions/monthlySummaryDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import TransactionPaginatedResponse from 'src/types/transactions/transactionPaginatedResponse';
import TransactionFilter from 'src/types/transactions/transactionsFilter';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import {
  BulkDeleteTransactionsDTO,
  BulkResultDTO,
  BulkUpdateCategoryDTO,
} from 'src/types/transactions/bulkTransactionsDTO';

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

  @Delete('transactions/:id')
  @HttpCode(204)
  async remove(@Param('id') id: string): Promise<void> {
    await this.transactionsService.remove(Number(id));
  }

  // Bulk routes live outside `transactions/` so they can't collide with `:id`.
  @Put('transactions-bulk/category')
  async updateCategoryMany(
    @Body() { ids, categoryId }: BulkUpdateCategoryDTO,
  ): Promise<BulkResultDTO> {
    return {
      count: await this.transactionsService.updateCategoryMany(ids, categoryId),
    };
  }

  @Delete('transactions-bulk')
  async removeMany(
    @Body() { ids }: BulkDeleteTransactionsDTO,
  ): Promise<BulkResultDTO> {
    return { count: await this.transactionsService.removeMany(ids) };
  }

  @Get('categories-amount')
  async getAmountByCategory(
    @Query() filters?: TransactionFilter,
  ): Promise<AmountByCategoryResponse> {
    return await this.transactionsService.getAmountByCategory(filters);
  }

  @Get('dashboard')
  async getDashboard(
    @Query() filters?: TransactionFilter,
  ): Promise<MonthlySummaryDTO> {
    return await this.transactionsService.getMonthlySummary(filters);
  }
}
