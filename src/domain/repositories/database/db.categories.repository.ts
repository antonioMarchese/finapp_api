import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import UpdateCategoryDTO from 'src/types/categories/updateCategoryDTO';
import { CategoryIcon } from 'src/types/categories/categoryIcons';
import CategoriesRepository from '../categories.repository';
import CategoryDTO from 'src/types/categories/categoryDTO';
import MonthlyCategoryTotalsDTO, {
  CategoryMonthlyTotals,
} from 'src/types/categories/monthlyCategoryTotalsDTO';
import slugfy from 'src/utils/slugify';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma.service';
import { Category } from 'generated/prisma';

@Injectable()
export class DBCategoriesRepository extends CategoriesRepository<Category> {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async create(createCategoryProps: CreateCategoryDTO): Promise<CategoryDTO> {
    const slug = slugfy(createCategoryProps.title);

    // New categories go to the end of the list.
    const last = await this.prismaService.category.aggregate({
      _max: { position: true },
    });

    const newCategory = await this.prismaService.category.create({
      data: {
        ...createCategoryProps,
        slug,
        position: (last._max.position ?? 0) + 1,
      },
    });

    return await Promise.resolve({
      ...this.toDTO(newCategory),
    });
  }

  async findAll(): Promise<CategoryDTO[]> {
    const categories = await this.prismaService.category.findMany({
      orderBy: [{ position: 'asc' }, { id: 'asc' }],
    });
    return await Promise.resolve(
      categories.map((category) => this.toDTO(category)),
    );
  }

  async findById(id: number): Promise<CategoryDTO | null> {
    const category = await this.prismaService.category.findUnique({
      where: { id },
    });
    if (!category) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(category));
  }

  async findBySlug(slug: string): Promise<CategoryDTO | null> {
    const category = await this.prismaService.category.findUnique({
      where: { slug },
    });

    if (!category) return await Promise.resolve(null);

    return await Promise.resolve(this.toDTO(category));
  }

  async update(id: number, props: UpdateCategoryDTO): Promise<CategoryDTO> {
    // Prisma leaves undefined fields untouched, so only what was sent changes.
    const updatedCategory = await this.prismaService.category.update({
      where: { id },
      data: {
        title: props.title,
        slug: props.title !== undefined ? slugfy(props.title) : undefined,
        color: props.color ?? undefined,
        type: props.type,
        icon: props.icon,
        active: props.active,
        weeklyBudget: props.weeklyBudget,
        excludeFromWeekly: props.excludeFromWeekly,
      },
    });

    return await Promise.resolve(this.toDTO(updatedCategory));
  }

  async reorder(ids: number[]): Promise<CategoryDTO[]> {
    await this.prismaService.$transaction(
      ids.map((id, position) =>
        this.prismaService.category.update({
          where: { id },
          data: { position },
        }),
      ),
    );

    return await this.findAll();
  }

  async remove(id: number): Promise<null> {
    await this.prismaService.category.delete({ where: { id } });

    return await Promise.resolve(null);
  }

  async getMonthlyTotals(): Promise<MonthlyCategoryTotalsDTO> {
    const rawResults = await this.prismaService.$queryRaw<
      Array<{
        categoryid: number;
        title: string;
        color: string | null;
        currency: string;
        month: string;
        total: number;
      }>
    >`
      SELECT 
        c.id as categoryid,
        c.title,
        c.color,
        t.currency::text as currency,
        TO_CHAR(t."dueDate", 'MM-YY') as month,
        SUM(t.amount) as total
      FROM categories c
      LEFT JOIN transactions t ON c.id = t."categoryId"
      WHERE t."dueDate" IS NOT NULL
      GROUP BY c.id, c.title, c.color, t.currency, TO_CHAR(t."dueDate", 'MM-YY')
      ORDER BY t.currency, c.id, month
    `;

    // Totals are bucketed per currency first, so values recorded in
    // different currencies never land in the same report.
    const result: Record<string, CategoryMonthlyTotals> = {};

    rawResults.forEach((row) => {
      if (!result[row.currency]) result[row.currency] = {};
      if (!result[row.currency][row.categoryid]) {
        result[row.currency][row.categoryid] = {
          title: row.title,
          color: row.color,
          reports: {},
        };
      }
      result[row.currency][row.categoryid].reports[row.month] = row.total;
    });

    return result;
  }

  toDTO(category: Category): CategoryDTO {
    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      color: category.color,
      type: category.type,
      icon: category.icon as CategoryIcon | null,
      active: category.active,
      weeklyBudget: category.weeklyBudget,
      excludeFromWeekly: category.excludeFromWeekly,
      position: category.position,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
