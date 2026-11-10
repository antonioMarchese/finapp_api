import { Module } from '@nestjs/common';
import { WeeklyGoalsController } from 'src/controllers/weeklyGoals.controller';
import { WeeklyGoalsService } from 'src/services/weeklyGoals.service';

@Module({
  controllers: [WeeklyGoalsController],
  providers: [WeeklyGoalsService],
})
export class WeeklyGoalsModule {}
