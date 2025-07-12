import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from 'src/services/categories.service';
import slugfy from 'src/utils/slugify';

import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';

describe('CategoriesController', () => {
  let controller: CategoriesController;

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
      id: expect.any(Number),
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    expect(mockCategoriesService.create).toHaveBeenCalled();
  });

  it('should find all categories', async () => {
    expect(await controller.findAll()).toEqual([]);
  });
});
