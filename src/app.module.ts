import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './modules/categories.module';
import { DatabaseModule } from './modules/database.module';
import { TransactionsModule } from './modules/transactions.module';
import { SettingsModule } from './modules/settings.module';
import { FixedTransactionsModule } from './modules/fixedTransactions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    TransactionsModule,
    SettingsModule,
    FixedTransactionsModule,
  ],
})
export class AppModule {}
