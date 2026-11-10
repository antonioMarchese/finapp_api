import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { WeeklyGoalsService } from 'src/services/weeklyGoals.service';
import UpdateWeeklyGoalsDTO from 'src/types/weeklyGoals/updateWeeklyGoalsDTO';
import WeeklyGoalsDTO from 'src/types/weeklyGoals/weeklyGoalsDTO';

@Controller()
export class WeeklyGoalsController {
  constructor(private readonly weeklyGoalsService: WeeklyGoalsService) {}

  @Get('weekly-goals')
  async get(): Promise<WeeklyGoalsDTO> {
    return await this.weeklyGoalsService.get();
  }

  @Put('weekly-goals')
  async update(@Body() props: UpdateWeeklyGoalsDTO): Promise<WeeklyGoalsDTO> {
    try {
      return await this.weeklyGoalsService.update(props);
    } catch (error) {
      let message: string = 'Error updating weekly goals';
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
