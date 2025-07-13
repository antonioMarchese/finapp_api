import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import Category from '../entities/category';
import CategoryDTO from 'src/types/categories/categoryDTO';

export default abstract class CategoriesRepository {
  abstract create(createCategoryProps: CreateCategoryDTO): Promise<CategoryDTO>;
  abstract update(id: number, props: CreateCategoryDTO): Promise<CategoryDTO>;
  abstract remove(id: number): Promise<null>;

  abstract findAll(): Promise<CategoryDTO[]>;
  abstract findById(id: number): Promise<CategoryDTO | null>;
  abstract findBySlug(slug: string): Promise<CategoryDTO | null>;

  abstract toDTO(category: Category): CategoryDTO;
}
