import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from 'src/services/categories.service';
import slugfy from 'src/utils/slugify';

import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import UpdateCategoryDTO from 'src/types/categories/updateCategoryDTO';
import MonthlyCategoryTotalsDTO from 'src/types/categories/monthlyCategoryTotalsDTO';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  const categorySchema = {
    id: expect.any(Number),
    title: expect.any(String),
    slug: expect.any(String),
    color: expect.any(String),
    createdAt: expect.any(Date),
    updatedAt: expect.any(Date),
  };

  const mockCategoriesService = {
    create: jest.fn((dto: CreateCategoryDTO) => {
      return {
        id: 1,
        slug: slugfy(dto.title),
        ...dto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }),
    findAll: jest.fn(async () => {
      return await Promise.resolve([]);
    }),
    findById: jest.fn(async (id: number) => {
      if (id !== 1) return await Promise.resolve(null);

      return await Promise.resolve({
        id: 1,
        slug: 'test',
        title: 'test',
        color: '#FF11AA',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
    update: jest.fn(async (id: number, dto: UpdateCategoryDTO) => {
      if (id !== 1) return await Promise.resolve(null);

      return await Promise.resolve({
        id: 1,
        ...dto,
        slug: slugfy(dto.title),
        color: dto.color ?? '#FF11AA',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }),
    getMonthlyTotals: jest.fn(async () => {
      const mockTotals: MonthlyCategoryTotalsDTO = {
        1: {
          title: 'Food',
          color: '#FF5733',
          reports: {
            '09-25': 150.5,
            '08-25': 200.0,
          },
        },
      };
      return await Promise.resolve(mockTotals);
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [CategoriesService],
    })
      .overrideProvider(CategoriesService)
      .useValue(mockCategoriesService)
      .compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    // testing constructor
    expect(controller).toBeDefined();
  });

  it('should create a category', async () => {
    const newCategoryData: CreateCategoryDTO = {
      title: 'Supermarket',
      color: '#e62e1ac2',
    };

    expect(await controller.create(newCategoryData)).toEqual({
      ...categorySchema,
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
    });
    expect(mockCategoriesService.create).toHaveBeenCalled();
  });

  it('should find all categories', async () => {
    expect(await controller.findAll()).toEqual([]);
  });

  it('should find a category by ID', async () => {
    expect(await controller.findById('1')).toEqual(categorySchema);
  });

  it('should throw an error if category not found', async () => {
    try {
      await controller.findById('10');
    } catch (error) {
      expect(error).toEqual(new Error('Category not found'));
    }
  });

  it('should update a category', async () => {
    const updateCategoryData: UpdateCategoryDTO = {
      title: 'Supermarket Updated',
      color: '#e62e1ac2',
    };

    expect(await controller.update('1', updateCategoryData)).toEqual({
      ...categorySchema,
      title: updateCategoryData.title,
      slug: slugfy(updateCategoryData.title),
      color: updateCategoryData.color,
    });
    expect(mockCategoriesService.update).toHaveBeenCalled();
  });

  it('should throw an error if category not found on update', async () => {
    const updateCategoryData: UpdateCategoryDTO = {
      title: 'Supermarket Updated',
      color: '#e62e1ac2',
    };

    try {
      await controller.update('10', updateCategoryData);
    } catch (error) {
      expect(error).toEqual(new Error('Category not found'));
    }
  });

  it('should get monthly totals', async () => {
    const expectedTotals: MonthlyCategoryTotalsDTO = {
      1: {
        title: 'Food',
        color: '#FF5733',
        reports: {
          '09-25': 150.5,
          '08-25': 200.0,
        },
      },
    };

    expect(await controller.getMonthlyTotals()).toEqual(expectedTotals);
    expect(mockCategoriesService.getMonthlyTotals).toHaveBeenCalled();
  });
});
