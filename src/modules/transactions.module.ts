import { Module } from '@nestjs/common';
import { TransactionsController } from 'src/controllers/transactions.controller';
import { InMemoTransactionsRepository } from 'src/domain/repositories/memo/memo.transactions.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import { TransactionsService } from 'src/services/transactions.service';

@Module({
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    {
      provide: TransactionsRepository,
      useClass: InMemoTransactionsRepository,
    },
  ],
})
export class TransactionsModule {}
