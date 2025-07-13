import { Injectable } from '@nestjs/common';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import CategoryDTO from 'src/types/categories/categoryDTO';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import slugfy from 'src/utils/slugify';

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository) {}

  async create(createCategoryProps: CreateCategoryDTO): Promise<CategoryDTO> {
    const existingSlug = await this.repository.findBySlug(
      slugfy(createCategoryProps.title),
    );
    if (existingSlug) throw new Error('Category already exists');

    return await this.repository.create(createCategoryProps);
  }

  async update(
    id: number,
    updateCategoryProps: CreateCategoryDTO,
  ): Promise<CategoryDTO> {
    const category: CategoryDTO | null = await this.repository.findById(id);
    if (!category) throw new Error('Category not found');

    const existingSlugCategory = await this.repository.findBySlug(
      slugfy(updateCategoryProps.title),
    );
    if (existingSlugCategory && existingSlugCategory.id !== id)
      throw new Error('Category already exists');

    return await this.repository.update(id, updateCategoryProps);
  }

  async remove(id: number): Promise<null> {
    const category: CategoryDTO | null = await this.repository.findById(id);
    if (!category) throw new Error('Category not found');

    return await this.repository.remove(id);
  }

  async findById(id: number): Promise<CategoryDTO | null> {
    return await this.repository.findById(id);
  }

  async findAll(): Promise<CategoryDTO[]> {
    return await this.repository.findAll();
  }
}
