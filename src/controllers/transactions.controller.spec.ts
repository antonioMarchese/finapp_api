import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsControllerController } from './transactions.controller';

describe('TransactionsControllerController', () => {
  let controller: TransactionsControllerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsControllerController],
    }).compile();

    controller = module.get<TransactionsControllerController>(
      TransactionsControllerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
