import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import slugfy from 'src/utils/slugify';
import CategoriesRepository from '../categories.repository';
import { InMemoCategoriesRepository } from './memo.categories.repository';
import Category from 'src/domain/entities/category';

describe('InMemoCategoriesRepository', () => {
  let repository: CategoriesRepository<Category>;
  const baseCategorySchema = {
    id: expect.any(Number),
    title: expect.any(String),
    slug: expect.any(String),
    color: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  };

  beforeAll(() => {
    repository = new InMemoCategoriesRepository();
  });

  it('should create a category', async () => {
    const newCategoryData: CreateCategoryDTO = {
      title: 'Supermarket',
      color: '#e62e1ac2',
    };

    expect(await repository.create(newCategoryData)).toEqual({
      ...baseCategorySchema,
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
    });
  });

  it('should find all categories', async () => {
    expect(await repository.findAll()).toHaveLength(1);
  });

  it('should find a category by ID', async () => {
    const categories = await repository.findAll();
    expect(categories).toHaveLength(1);

    const category = await repository.findById(categories[0].id);
    expect(category).toEqual({
      ...baseCategorySchema,
      title: categories[0].title,
      slug: slugfy(categories[0].title),
      color: categories[0].color,
    });
  });

  it('should find a category by slug', async () => {
    const categories = await repository.findAll();
    expect(categories).toHaveLength(1);

    const category = await repository.findBySlug(categories[0].slug);
    expect(category).toEqual({
      ...baseCategorySchema,
      title: categories[0].title,
      slug: slugfy(categories[0].title),
      color: categories[0].color,
    });
  });

  it('should cast a Category class to DTO', () => {
    const category = new Category(
      3,
      'test',
      'test',
      '#FFFFFF',
      new Date(),
      new Date(),
    );

    expect(repository.toDTO(category)).toEqual({
      ...baseCategorySchema,
      title: category.getTitle(),
      slug: slugfy(category.getTitle()),
      color: category.getColor(),
    });
  });

  it('should update a category', async () => {
    const id = 1;
    const updateCategoryProps: CreateCategoryDTO = {
      title: 'Updated Category',
      color: '#001122',
    };
    const category = await repository.findById(id);
    expect(category).not.toBeNull();

    const updatedCategory = await repository.update(id, updateCategoryProps);
    const categorySchema = {
      ...baseCategorySchema,
      id,
      title: updateCategoryProps.title,
      slug: slugfy(updateCategoryProps.title),
      color: updateCategoryProps.color,
    };

    expect(updatedCategory).toEqual(categorySchema);
    expect(await repository.findById(id)).toEqual(categorySchema);
  });

  it('should remove a category', async () => {
    const id = 1;
    expect(await repository.findById(id)).not.toBeNull();

    await repository.remove(id);
    expect(await repository.findById(id)).toBeNull();
  });
});
