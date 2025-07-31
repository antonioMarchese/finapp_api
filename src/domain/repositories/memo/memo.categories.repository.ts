import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import CategoriesRepository from '../categories.repository';
import Category from 'src/domain/entities/category';
import CategoryDTO from 'src/types/categories/categoryDTO';
import slugfy from 'src/utils/slugify';
import { inMemoCategories } from './memo.db';

export class InMemoCategoriesRepository extends CategoriesRepository<Category> {
  private lastId: number = 1;

  private upgradeId() {
    this.lastId++;
  }

  private addCategory(category: Category) {
    inMemoCategories.push(category);
    this.upgradeId();
  }

  async create(createCategoryProps: CreateCategoryDTO): Promise<CategoryDTO> {
    const newCategory: Category = new Category(
      this.lastId,
      slugfy(createCategoryProps.title),
      createCategoryProps.title,
      createCategoryProps.color ?? '#FAAA4F',
      new Date(),
      new Date(),
    );
    this.addCategory(newCategory);

    console.log('New category added');
    return await Promise.resolve(this.toDTO(newCategory));
  }

  async findAll(): Promise<CategoryDTO[]> {
    return await Promise.resolve(
      inMemoCategories.map((category) => ({
        ...this.toDTO(category),
      })),
    );
  }

  async findById(id: number): Promise<CategoryDTO | null> {
    const category = inMemoCategories.find(
      (category) => category.getId() === id,
    );

    if (!category) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(category));
  }

  async findBySlug(slug: string): Promise<CategoryDTO | null> {
    const category = inMemoCategories.find(
      (category) => category.getSlug() === slug,
    );

    if (!category) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(category));
  }

  async update(id: number, props: CreateCategoryDTO): Promise<CategoryDTO> {
    const category = inMemoCategories.find(
      (category) => category.getId() === id,
    )!;

    category.setTitle(props.title);
    category.setSlug(slugfy(props.title));
    category.setColor(props.color ?? category.getColor());
    category.setUpdatedAt();

    return await Promise.resolve(this.toDTO(category));
  }

  async remove(id: number): Promise<null> {
    inMemoCategories.splice(
      inMemoCategories.findIndex((category) => category.getId() === id),
    );

    return await Promise.resolve(null);
  }

  toDTO(category: Category): CategoryDTO {
    return {
      id: category.getId(),
      slug: category.getSlug(),
      title: category.getTitle(),
      color: category.getColor(),
      createdAt: category.getCreatedAt().toISOString(),
      updatedAt: category.getUpdatedAt().toISOString(),
    };
  }
}
