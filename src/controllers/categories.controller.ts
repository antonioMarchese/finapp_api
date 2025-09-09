import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import CategoryDTO from 'src/types/categories/categoryDTO';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';
import UpdateCategoryDTO from 'src/types/categories/updateCategoryDTO';
import MonthlyCategoryTotalsDTO from 'src/types/categories/monthlyCategoryTotalsDTO';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  async findAll(): Promise<CategoryDTO[]> {
    return await this.categoriesService.findAll();
  }

  @Get('categories/:id')
  async findById(@Param('id') id: string): Promise<CategoryDTO> {
    const category = await this.categoriesService.findById(Number(id));
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  @Post('categories')
  async create(@Body() category: CreateCategoryDTO): Promise<CategoryDTO> {
    try {
      return await this.categoriesService.create(category);
    } catch (error) {
      let message: string = 'Erro ao criar categoria';
      if (error instanceof Error) message = error.message;

      throw new HttpException(
        {
          status: 400,
          error: message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('categories/:id')
  async update(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDTO,
  ): Promise<CategoryDTO> {
    try {
      return await this.categoriesService.update(Number(id), category);
    } catch (error) {
      let message: string = 'Erro ao atualizar categoria';
      if (error instanceof Error) message = error.message;

      throw new HttpException(
        {
          status: 400,
          error: message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('categories-monthly-totals')
  async getMonthlyTotals(): Promise<MonthlyCategoryTotalsDTO> {
    try {
      return await this.categoriesService.getMonthlyTotals();
    } catch (error) {
      let message: string = 'Error retrieving monthly totals';
      if (error instanceof Error) message = error.message;

      throw new HttpException(
        {
          status: 500,
          error: message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
