import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from 'src/services/transactions.service';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import {
  mockCreateTransaction,
  transactionSchema,
} from 'src/types/transactions/testSchemas';
import { NotFoundException } from '@nestjs/common';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockTransaction: TransactionDTO = {
    id: 1,
    amount: 100,
    dueDate: new Date(),
    type: 'income',
    createdAt: new Date(),
    updatedAt: new Date(),
    description: 'Test transaction',
    category: {
      id: 1,
      title: 'Supermarket',
      color: '#e62e1ac2',
    },
  };

  const mockTransactionsService = {
    findAll: jest.fn(async () => {
      return await Promise.resolve([]);
    }),
    findById: jest.fn(async (id: number) => {
      if (id !== 1) return await Promise.resolve(null);

      return await Promise.resolve(mockTransaction);
    }),
    create: jest.fn(
      async (props: CreateTransactionDTO): Promise<TransactionDTO> => {
        return await Promise.resolve({
          id: 1,
          dueDate: props.dueDate,
          type: props.type,
          amount: props.amount,
          description: props.description,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: 1,
            title: 'test',
            color: '#123123',
          },
        });
      },
    ),
    update: jest.fn(
      async (
        id: number,
        props: UpdateTransactionDTO,
      ): Promise<TransactionDTO> => {
        if (id !== 1) throw new NotFoundException('Transaction not found');

        if (props.categoryId !== 1)
          throw new NotFoundException('Invalid category');

        return await Promise.resolve({
          id: 1,
          dueDate: props.dueDate,
          type: props.type,
          amount: props.amount,
          description: props.description,
          createdAt: new Date(),
          updatedAt: new Date(),
          category: {
            id: props.categoryId,
            title: 'test',
            color: '#123123',
          },
        });
      },
    ),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should get all transactions', async () => {
    expect(await controller.findAll()).toEqual([]);
  });

  it('should get a transaction by id', async () => {
    expect(await controller.findById('1')).toEqual(transactionSchema);
  });

  it('should throw an error if transaction does not exist', async () => {
    try {
      await controller.findById('10');
    } catch (error) {
      expect(error).toEqual(new NotFoundException('Transaction not found'));
    }
  });

  it('should create a transaction', async () => {
    const newTransactionData: CreateTransactionDTO = {
      ...mockCreateTransaction,
      categoryId: 1,
      type: 'expense',
    };

    expect(await controller.create(newTransactionData)).toEqual({
      ...transactionSchema,
    });
    expect(mockTransactionsService.create).toHaveBeenCalled();
  });

  it('should throw an error if category does not exist on create', async () => {
    try {
      await controller.create({
        ...mockCreateTransaction,
        categoryId: 10,
        type: 'expense',
      });
    } catch (error) {
      expect(error).toEqual(new Error('Invalid category'));
    }

    expect(mockTransactionsService.create).toHaveBeenCalled();
  });

  it('should update a transaction', async () => {
    const updateTransactionData: UpdateTransactionDTO = {
      ...mockCreateTransaction,
      categoryId: 1,
      type: 'investment',
    };

    expect(await controller.update('1', updateTransactionData)).toEqual({
      ...transactionSchema,
    });
    expect(mockTransactionsService.update).toHaveBeenCalled();
  });

  it('should throw an error if category does not exist on update', async () => {
    const updateTransactionData: UpdateTransactionDTO = {
      ...mockCreateTransaction,
      categoryId: 10,
      type: 'investment',
    };

    try {
      await controller.update('1', updateTransactionData);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid category'));
    }
  });
  it('should throw an error if transaction does not exist on update', async () => {
    const updateTransactionData: UpdateTransactionDTO = {
      ...mockCreateTransaction,
      categoryId: 1,
      type: 'investment',
    };

    try {
      await controller.update('10', updateTransactionData);
    } catch (error) {
      expect(error).toEqual(new Error('Transaction not found'));
    }
  });
});
