import { Module } from '@nestjs/common';
import { TransactionsController } from 'src/controllers/transactions.controller';
import { TransactionsService } from 'src/services/transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
