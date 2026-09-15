import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { SettingsService } from 'src/services/settings.service';
import SettingsDTO from 'src/types/settings/settingsDTO';
import UpdateSettingsDTO from 'src/types/settings/updateSettingsDTO';

@Controller()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('settings')
  async get(): Promise<SettingsDTO> {
    return await this.settingsService.get();
  }

  @Put('settings')
  async update(@Body() props: UpdateSettingsDTO): Promise<SettingsDTO> {
    try {
      return await this.settingsService.update(props);
    } catch (error) {
      let message: string = 'Error updating settings';
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
