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

  async findAll(): Promise<CategoryDTO[]> {
    return await this.repository.findAll();
  }
}
