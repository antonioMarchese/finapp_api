import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import UpdateCategoryDTO from 'src/types/categories/updateCategoryDTO';
import CategoriesRepository from '../categories.repository';
import Category from 'src/domain/entities/category';
import CategoryDTO from 'src/types/categories/categoryDTO';
import MonthlyCategoryTotalsDTO from 'src/types/categories/monthlyCategoryTotalsDTO';
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
      createCategoryProps.type,
      createCategoryProps.icon ?? null,
      createCategoryProps.active ?? true,
      createCategoryProps.weeklyBudget ?? null,
      this.lastId,
      createCategoryProps.excludeFromWeekly ?? false,
    );
    this.addCategory(newCategory);

    console.log('New category added');
    return await Promise.resolve(this.toDTO(newCategory));
  }

  async findAll(): Promise<CategoryDTO[]> {
    const ordered = [...inMemoCategories].sort(
      (a, b) => a.getPosition() - b.getPosition() || a.getId() - b.getId(),
    );

    return await Promise.resolve(
      ordered.map((category) => ({
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

  async update(id: number, props: UpdateCategoryDTO): Promise<CategoryDTO> {
    const category = inMemoCategories.find(
      (category) => category.getId() === id,
    )!;

    if (props.title !== undefined) {
      category.setTitle(props.title);
      category.setSlug(slugfy(props.title));
    }
    category.setColor(props.color ?? category.getColor());
    if (props.type !== undefined) category.setType(props.type);
    if (props.icon !== undefined) category.setIcon(props.icon);
    if (props.active !== undefined) category.setActive(props.active);
    if (props.weeklyBudget !== undefined)
      category.setWeeklyBudget(props.weeklyBudget);
    if (props.excludeFromWeekly !== undefined)
      category.setExcludeFromWeekly(props.excludeFromWeekly);
    category.setUpdatedAt();

    return await Promise.resolve(this.toDTO(category));
  }

  async reorder(ids: number[]): Promise<CategoryDTO[]> {
    ids.forEach((id, position) =>
      inMemoCategories
        .find((category) => category.getId() === id)
        ?.setPosition(position),
    );

    return await this.findAll();
  }

  async remove(id: number): Promise<null> {
    inMemoCategories.splice(
      inMemoCategories.findIndex((category) => category.getId() === id),
    );

    return await Promise.resolve(null);
  }

  async getMonthlyTotals(): Promise<MonthlyCategoryTotalsDTO> {
    // Mock data for testing
    const mockResult: MonthlyCategoryTotalsDTO = {
      BRL: {
        1: {
          title: 'Food',
          color: '#FF5733',
          reports: {
            '09-25': 150.5,
            '08-25': 200.0,
          },
        },
        2: {
          title: 'Transport',
          color: '#33FF57',
          reports: {
            '09-25': 75.25,
            '07-25': 100.0,
          },
        },
      },
    };

    return await Promise.resolve(mockResult);
  }

  toDTO(category: Category): CategoryDTO {
    return {
      id: category.getId(),
      slug: category.getSlug(),
      title: category.getTitle(),
      color: category.getColor(),
      type: category.getType(),
      icon: category.getIcon(),
      active: category.isActive(),
      weeklyBudget: category.getWeeklyBudget(),
      excludeFromWeekly: category.isExcludedFromWeekly(),
      position: category.getPosition(),
      createdAt: category.getCreatedAt().toISOString(),
      updatedAt: category.getUpdatedAt().toISOString(),
    };
  }
}
