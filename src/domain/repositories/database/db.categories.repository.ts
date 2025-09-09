import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import CategoriesRepository from '../categories.repository';
import CategoryDTO from 'src/types/categories/categoryDTO';
import MonthlyCategoryTotalsDTO from 'src/types/categories/monthlyCategoryTotalsDTO';
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

    const newCategory = await this.prismaService.category.create({
      data: { ...createCategoryProps, slug },
    });

    return await Promise.resolve({
      ...this.toDTO(newCategory),
    });
  }

  async findAll(): Promise<CategoryDTO[]> {
    const categories = await this.prismaService.category.findMany();
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

  async update(id: number, props: CreateCategoryDTO): Promise<CategoryDTO> {
    const category = await this.findById(id);

    const updatedCategory = await this.prismaService.category.update({
      where: { id },
      data: {
        title: props.title ?? category?.title,
        color: props.color ?? category?.color,
        slug: slugfy(props.title ?? category?.title),
      },
    });

    return await Promise.resolve(this.toDTO(updatedCategory));
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
        month: string;
        total: number;
      }>
    >`
      SELECT 
        c.id as categoryid,
        c.title,
        c.color,
        TO_CHAR(t."dueDate", 'MM-YY') as month,
        SUM(t.amount) as total
      FROM categories c
      LEFT JOIN transactions t ON c.id = t."categoryId"
      WHERE t."dueDate" IS NOT NULL
      GROUP BY c.id, c.title, c.color, TO_CHAR(t."dueDate", 'MM-YY')
      ORDER BY c.id, month
    `;

    const result: MonthlyCategoryTotalsDTO = {};

    rawResults.forEach((row) => {
      if (!result[row.categoryid]) {
        result[row.categoryid] = {
          title: row.title,
          color: row.color,
          reports: {},
        };
      }
      result[row.categoryid].reports[row.month] = row.total;
    });

    return result;
  }

  toDTO(category: Category): CategoryDTO {
    return {
      id: category.id,
      slug: category.slug,
      title: category.title,
      color: category.color,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  }
}
