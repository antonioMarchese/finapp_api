import { Global, Module } from '@nestjs/common';
import { InMemoCategoriesRepository } from 'src/domain/repositories/memo/memo.categories.repository';
import CategoriesRepository from 'src/domain/repositories/categories.repository';

@Global()
@Module({
  providers: [
    {
      provide: CategoriesRepository,
      useClass: InMemoCategoriesRepository,
    },
  ],
  exports: [CategoriesRepository],
})
export class DatabaseModule {}
