import { Test, TestingModule } from '@nestjs/testing';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { CategoriesService } from 'src/services/categories.service';
import CategoryDTO from 'src/types/categories/categoryDTO';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import slugfy from 'src/utils/slugify';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const categories: CategoryDTO[] = [];

  const mockCategoriesRepository = {
    create: jest.fn(async (dto: CreateCategoryDTO) => {
      const newDTOCategory: CategoryDTO = {
        id: 1,
        slug: slugfy(dto.title),
        ...dto,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      categories.push(newDTOCategory);
      return await Promise.resolve(newDTOCategory);
    }),
    findAll: jest.fn(async () => {
      return await Promise.resolve([]);
    }),
    findBySlug: jest.fn(async (slug: string) => {
      return await Promise.resolve(
        categories.find((category) => category.slug === slug),
      );
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: CategoriesRepository,
          useValue: mockCategoriesRepository,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a category', async () => {
    const newCategoryData: CreateCategoryDTO = {
      title: 'Supermarket',
      color: '#e62e1ac2',
    };

    expect(await service.create(newCategoryData)).toEqual({
      id: expect.any(Number),
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(mockCategoriesRepository.create).toHaveBeenCalled();
  });

  it('should fetch all categories', async () => {
    expect(await service.findAll()).toEqual([]);
    expect(mockCategoriesRepository.findAll).toHaveBeenCalled();
  });

  it('should not create a category with existing slug', async () => {
    const newCategoryData: CreateCategoryDTO = {
      title: 'supermarket',
      color: '#e62e1ac2',
    };

    try {
      await service.create(newCategoryData);
    } catch (error) {
      expect(error).toEqual(new Error('Category already exists'));
    }

    expect(mockCategoriesRepository.create).toHaveBeenCalled();
  });
});
