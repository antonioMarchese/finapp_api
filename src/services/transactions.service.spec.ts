import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import TransactionsRepository from 'src/domain/repositories/transactions.repository';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { inMemoTransactions } from 'src/domain/repositories/memo/memo.db';
import CreateTransactionDTO from 'src/types/transactions/createTransactionDTO';
import CategoryDTO from 'src/types/categories/categoryDTO';
import TransactionDTO from 'src/types/transactions/transactionDTO';
import Category from 'src/domain/entities/category';
import Transaction from 'src/domain/entities/transaction';
import UpdateTransactionDTO from 'src/types/transactions/updateTransactionDTO';
import { transactionSchema } from 'src/types/transactions/testSchemas';

describe('TransactionsService', () => {
  let service: TransactionsService;
  const mockCategory: Category = new Category(
    1,
    'supermarket',
    'Supermarket',
    '#e62e1ac2',
    new Date(),
    new Date(),
  );

  const toDTO = (transaction: Transaction): TransactionDTO => {
    return {
      id: 1,
      amount: transaction.getAmount(),
      description: transaction.getDescription(),
      dueDate: transaction.getDueDate(),
      type: transaction.getType(),
      createdAt: transaction.getCreatedAt(),
      updatedAt: transaction.getUpdatedAt(),
      category: {
        id: mockCategory.getId(),
        title: mockCategory.getTitle(),
        color: mockCategory.getColor(),
      },
    };
  };

  const mockTransactionsRepository = {
    findAll: jest.fn(async () => {
      return await Promise.resolve([...inMemoTransactions]);
    }),
    findById: jest.fn(async (id: number) => {
      const transaction = inMemoTransactions.find(
        (transaction) => transaction.getId() === id,
      );

      if (!transaction) return Promise.resolve(null);

      return await Promise.resolve({
        id: 1,
        amount: transaction.getAmount(),
        description: transaction.getDescription(),
        dueDate: transaction.getDueDate(),
        type: transaction.getType(),
        createdAt: transaction.getCreatedAt(),
        updatedAt: transaction.getUpdatedAt(),
        category: {
          id: mockCategory.getId(),
          title: mockCategory.getTitle(),
          color: mockCategory.getColor(),
        },
      });
    }),
    create: jest.fn(
      async (props: CreateTransactionDTO): Promise<TransactionDTO | null> => {
        const newTransaction = new Transaction(
          1,
          props.amount,
          props.dueDate,
          props.type,
          props.categoryId,
          props.description,
        );
        inMemoTransactions.push(newTransaction);

        return await Promise.resolve(toDTO(newTransaction));
      },
    ),
    update: jest.fn(
      async (
        id: number,
        props: UpdateTransactionDTO,
      ): Promise<TransactionDTO | null> => {
        const transaction = inMemoTransactions.find(
          (transaction) => transaction.getId() === id,
        )!;

        transaction.setAmount(props.amount);
        transaction.setDueDate(props.dueDate);
        transaction.setType(props.type);
        transaction.setDescription(props.description);
        transaction.setUpdatedAt();

        return await Promise.resolve(toDTO(transaction));
      },
    ),
    remove: jest.fn(async (id: number): Promise<null> => {
      inMemoTransactions.splice(
        inMemoTransactions.findIndex(
          (transaction) => transaction.getId() === id,
        ),
      );
      return await Promise.resolve(null);
    }),
  };

  const mockCategoriesRepository = {
    findById: jest.fn(async (id: number): Promise<CategoryDTO | null> => {
      return await Promise.resolve({
        id,
        title: mockCategory.getTitle(),
        slug: mockCategory.getSlug(),
        color: mockCategory.getColor(),
        createdAt: mockCategory.getCreatedAt().toISOString(),
        updatedAt: mockCategory.getUpdatedAt().toISOString(),
      });
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a transaction', async () => {
    const newTransactionData: CreateTransactionDTO = {
      amount: 100,
      dueDate: new Date(),
      type: 'income',
      categoryId: 1,
      description: 'Test transaction',
    };
    expect(await service.create(newTransactionData)).toEqual(transactionSchema);
  });

  it('should throw error if category does not exist', async () => {
    const newTransactionData: CreateTransactionDTO = {
      amount: 100,
      dueDate: new Date(),
      type: 'income',
      categoryId: 2,
      description: 'Test transaction',
    };

    try {
      await service.create(newTransactionData);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid category'));
    }

    expect(mockTransactionsRepository.create).toHaveBeenCalled();
  });

  it('should return all transactions', async () => {
    expect(await service.findAll()).toHaveLength(inMemoTransactions.length);
    expect(mockTransactionsRepository.findAll).toHaveBeenCalled();
  });

  it('should find a transaction by its id', async () => {
    expect(await service.findById(1)).toEqual(transactionSchema);
    expect(mockTransactionsRepository.findById).toHaveBeenCalled();
  });

  it('should update a category', async () => {
    const updatedTransactionData: UpdateTransactionDTO = {
      amount: 150,
      dueDate: new Date(),
      type: 'expense',
      categoryId: 1,
      description: 'Transaction updated',
    };
    expect(await service.update(1, updatedTransactionData)).toEqual({
      ...transactionSchema,
      amount: updatedTransactionData.amount,
      dueDate: updatedTransactionData.dueDate,
      type: updatedTransactionData.type,
      description: updatedTransactionData.description,
    });
  });

  it('should throw error if category does not exist on update', async () => {
    const updateTransactionData: UpdateTransactionDTO = {
      amount: 100,
      dueDate: new Date(),
      type: 'income',
      categoryId: 2,
      description: 'Test transaction',
    };

    try {
      await service.update(1, updateTransactionData);
    } catch (error) {
      expect(error).toEqual(new Error('Invalid category'));
    }

    expect(mockTransactionsRepository.update).toHaveBeenCalled();
  });

  it('should throw error if transaction does not exist on update', async () => {
    const updateTransactionData: UpdateTransactionDTO = {
      amount: 100,
      dueDate: new Date(),
      type: 'income',
      categoryId: 2,
      description: 'Test transaction',
    };

    try {
      await service.update(10, updateTransactionData);
    } catch (error) {
      expect(error).toEqual(new Error('Transaction not found'));
    }

    expect(mockTransactionsRepository.update).toHaveBeenCalled();
  });

  it('should remove a transaction', async () => {
    expect(await service.remove(1)).toBeNull();
    expect(mockTransactionsRepository.remove).toHaveBeenCalled();

    expect(await service.findById(1)).toBeNull();
  });

  it('should throw an error if transaction does not exist on remove', async () => {
    try {
      await service.remove(10);
    } catch (error) {
      expect(error).toEqual(new Error('Transaction not found'));
    }
  });
});
