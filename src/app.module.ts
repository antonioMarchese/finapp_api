import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoriesModule } from './modules/categories.module';
import { DatabaseModule } from './modules/database.module';
import { TransactionsModule } from './modules/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CategoriesModule,
    TransactionsModule,
  ],
})
export class AppModule {}
