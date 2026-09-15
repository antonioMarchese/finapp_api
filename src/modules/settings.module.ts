import { Module } from '@nestjs/common';
import { SettingsController } from 'src/controllers/settings.controller';
import { SettingsService } from 'src/services/settings.service';

@Module({
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}
