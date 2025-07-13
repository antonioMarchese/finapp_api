import { Test, TestingModule } from '@nestjs/testing';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import { CategoriesService } from 'src/services/categories.service';
import CategoryDTO from 'src/types/categories/categoryDTO';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import slugfy from 'src/utils/slugify';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const categories: CategoryDTO[] = [];
  const categorySchema = {
    id: expect.any(Number),
    title: expect.any(String),
    slug: expect.any(String),
    color: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  };

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
    findById: jest.fn(async (id: number) => {
      return await Promise.resolve(
        categories.find((category) => category.id === id),
      );
    }),
    update: jest.fn(async (id: number, dto: CreateCategoryDTO) => {
      const category = categories.find((category) => category.id === id)!;
      category.title = dto.title;
      category.slug = slugfy(dto.title);
      category.color = dto.color ?? category.color;
      category.updatedAt = new Date().toISOString();

      return await Promise.resolve(category);
    }),
    remove: jest.fn(async (id: number) => {
      categories.splice(
        categories.findIndex((category) => category.id === id),
        1,
      );
      return await Promise.resolve(null);
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
      ...categorySchema,
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
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

  it('should update a category', async () => {
    const id = 1;
    const updateCategoryProps: CreateCategoryDTO = {
      title: 'Updated Category',
      color: '#001122',
    };

    expect(await service.update(id, updateCategoryProps)).toEqual({
      ...categorySchema,
      title: updateCategoryProps.title,
      color: updateCategoryProps.color,
    });
  });

  it('should throw error when category with that slug alredy exists', async () => {
    const id = 1;
    const createCategoryProps: CreateCategoryDTO = {
      title: 'New Category',
      color: '#001122',
    };
    await service.create(createCategoryProps);

    try {
      await service.update(id, createCategoryProps);
    } catch (error) {
      expect(error).toEqual(new Error('Category already exists'));
    }
  });

  it('should update only category color', async () => {
    const id = 1;
    const updateCategoryProps: CreateCategoryDTO = {
      title: 'Supermarket',
      color: '#AABBCC',
    };

    expect(await service.update(id, updateCategoryProps)).toEqual({
      ...categorySchema,
      title: updateCategoryProps.title,
      color: updateCategoryProps.color,
    });
  });

  it('should throw error when category not found on update', async () => {
    const id = 10;
    const updateCategoryProps: CreateCategoryDTO = {
      title: 'Updated Category',
      color: '#001122',
    };

    try {
      await service.update(id, updateCategoryProps);
    } catch (error) {
      expect(error).toEqual(new Error('Category not found'));
    }
  });

  it('should remove a category', async () => {
    const newCategoryData: CategoryDTO = {
      id: 20,
      title: 'Testing Category',
      slug: 'testing_category',
      color: '#112233',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    categories.push(newCategoryData);

    expect(await service.remove(newCategoryData.id)).toBeNull();
    expect(
      await mockCategoriesRepository.findById(newCategoryData.id),
    ).toBeUndefined();
  });

  it('should throw error if category not found when trying to remove a category', async () => {
    try {
      await service.remove(20);
    } catch (error) {
      expect(error).toEqual(new Error('Category not found'));
    }
  });
});
