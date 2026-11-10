import { Injectable } from '@nestjs/common';
import { Category } from 'generated/prisma';
import CategoriesRepository from 'src/domain/repositories/categories.repository';
import CategoryDTO from 'src/types/categories/categoryDTO';
import { isCategoryIcon } from 'src/types/categories/categoryIcons';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import MonthlyCategoryTotalsDTO from 'src/types/categories/monthlyCategoryTotalsDTO';
import UpdateCategoryDTO from 'src/types/categories/updateCategoryDTO';
import { isTransactionType } from 'src/types/transactions/transactionTypes';
import slugfy from 'src/utils/slugify';

// A budget is either absent (null) or a non-negative amount.
export function isValidBudget(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isFinite(value) && value >= 0)
  );
}

@Injectable()
export class CategoriesService {
  constructor(private readonly repository: CategoriesRepository<Category>) {}

  private assertValid(props: UpdateCategoryDTO) {
    if (props.title !== undefined && !props.title?.trim())
      throw new Error('Category title is required');
    if (props.type !== undefined && !isTransactionType(props.type))
      throw new Error('Invalid category type');
    if (
      props.icon !== undefined &&
      props.icon !== null &&
      !isCategoryIcon(props.icon)
    )
      throw new Error('Invalid category icon');
    if (props.active !== undefined && typeof props.active !== 'boolean')
      throw new Error('Active must be true or false');
    if (
      props.excludeFromWeekly !== undefined &&
      typeof props.excludeFromWeekly !== 'boolean'
    )
      throw new Error('Exclude from weekly must be true or false');
    if (props.weeklyBudget !== undefined && !isValidBudget(props.weeklyBudget))
      throw new Error('Weekly budget must be empty or a positive amount');
  }

  async create(createCategoryProps: CreateCategoryDTO): Promise<CategoryDTO> {
    this.assertValid(createCategoryProps);

    const existingSlug = await this.repository.findBySlug(
      slugfy(createCategoryProps.title),
    );
    if (existingSlug) throw new Error('Category already exists');

    return await this.repository.create(createCategoryProps);
  }

  async update(
    id: number,
    updateCategoryProps: UpdateCategoryDTO,
  ): Promise<CategoryDTO> {
    const category: CategoryDTO | null = await this.repository.findById(id);
    if (!category) throw new Error('Category not found');

    this.assertValid(updateCategoryProps);

    if (updateCategoryProps.title !== undefined) {
      const existingSlugCategory = await this.repository.findBySlug(
        slugfy(updateCategoryProps.title),
      );
      if (existingSlugCategory && existingSlugCategory.id !== id)
        throw new Error('Category already exists');
    }

    return await this.repository.update(id, updateCategoryProps);
  }

  async reorder(ids: number[]): Promise<CategoryDTO[]> {
    const categories = await this.repository.findAll();
    const known = new Set(categories.map((category) => category.id));

    if (
      !Array.isArray(ids) ||
      ids.length !== known.size ||
      new Set(ids).size !== ids.length ||
      !ids.every((id) => known.has(id))
    )
      throw new Error('The new order must list every category exactly once');

    return await this.repository.reorder(ids);
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

  async getMonthlyTotals(): Promise<MonthlyCategoryTotalsDTO> {
    return await this.repository.getMonthlyTotals();
  }
}
