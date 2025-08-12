import { Global, Module } from '@nestjs/common';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { PrismaService } from 'src/services/prisma.service';
import { DBCategoriesRepository } from 'src/domain/repositories/database/db.categories.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import { DBTransactionsRepository } from 'src/domain/repositories/database/db.transactions.repository';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: CategoriesRepository,
      useClass: DBCategoriesRepository,
    },
    {
      provide: TransactionsRepository,
      useClass: DBTransactionsRepository,
    },
  ],
  exports: [CategoriesRepository, TransactionsRepository],
})
export class DatabaseModule {}
