import { Global, Module } from '@nestjs/common';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { PrismaService } from 'src/services/prisma.service';
import { DBCategoriesRepository } from 'src/domain/repositories/database/db.categories.repository';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import { DBTransactionsRepository } from 'src/domain/repositories/database/db.transactions.repository';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import { DBSettingsRepository } from 'src/domain/repositories/database/db.settings.repository';
import FixedTransactionsRepository from 'src/domain/repositories/fixedTransactions.repository';
import { DBFixedTransactionsRepository } from 'src/domain/repositories/database/db.fixedTransactions.repository';

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
    {
      provide: SettingsRepository,
      useClass: DBSettingsRepository,
    },
    {
      provide: FixedTransactionsRepository,
      useClass: DBFixedTransactionsRepository,
    },
  ],
  exports: [
    CategoriesRepository,
    TransactionsRepository,
    SettingsRepository,
    FixedTransactionsRepository,
  ],
})
export class DatabaseModule {}
