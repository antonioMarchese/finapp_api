import { Module } from '@nestjs/common';
import { FixedTransactionsController } from 'src/controllers/fixedTransactions.controller';
import { FixedTransactionsService } from 'src/services/fixedTransactions.service';

@Module({
  controllers: [FixedTransactionsController],
  providers: [FixedTransactionsService],
})
export class FixedTransactionsModule {}
