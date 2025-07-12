import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  // NotFoundException,
  // Param,
  Post,
} from '@nestjs/common';
import { CategoriesService } from '../services/categories.service';
import CategoryDTO from 'src/types/categories/categoryDTO';
import CreateCategoryDTO from 'src/types/categories/createCategoryDTO';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('categories')
  async findAll(): Promise<CategoryDTO[]> {
    return await this.categoriesService.findAll();
  }

  // @Get('categories/:id')
  // async getCategoryById(@Param('id') id: string): Promise<CategoryDTO> {
  //   const category = await this.CategoriesService.getCategoryById(id);
  //   if (!category) {
  //     throw new NotFoundException('Invalid category');
  //   }

  //   return this.CategoriesService.toDTO(category);
  // }

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
}
