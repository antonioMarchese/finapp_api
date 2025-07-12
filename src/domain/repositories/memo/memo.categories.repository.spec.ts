import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import slugfy from 'src/utils/slugify';
import CategoriesRepository from '../categories.repository';
import { InMemoCategoriesRepository } from './memo.categories.repository';
import Category from 'src/domain/entities/category';

describe('InMemoCategoriesRepository', () => {
  let repository: CategoriesRepository;

  beforeAll(() => {
    repository = new InMemoCategoriesRepository();
  });

  it('should create a category', async () => {
    const newCategoryData: CreateCategoryDTO = {
      title: 'Supermarket',
      color: '#e62e1ac2',
    };

    expect(await repository.create(newCategoryData)).toEqual({
      id: expect.any(Number),
      title: newCategoryData.title,
      slug: slugfy(newCategoryData.title),
      color: newCategoryData.color,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
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
      id: expect.any(Number),
      title: categories[0].title,
      slug: slugfy(categories[0].title),
      color: categories[0].color,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  it('should find a category by slug', async () => {
    const categories = await repository.findAll();
    expect(categories).toHaveLength(1);

    const category = await repository.findBySlug(categories[0].slug);
    expect(category).toEqual({
      id: expect.any(Number),
      title: categories[0].title,
      slug: slugfy(categories[0].title),
      color: categories[0].color,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
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
      id: expect.any(Number),
      title: category.getTitle(),
      slug: slugfy(category.getTitle()),
      color: category.getColor(),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
