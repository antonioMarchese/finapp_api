import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import CategoriesRepository from '../categories.repository';
import CategoryDTO from 'src/types/categories/categoryDTO';
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
