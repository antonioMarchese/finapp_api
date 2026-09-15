import { Injectable } from '@nestjs/common';
import { AppSettings } from 'generated/prisma';
import { PrismaService } from 'src/services/prisma.service';
import SettingsDTO from 'src/types/settings/settingsDTO';
import UpdateSettingsDTO from 'src/types/settings/updateSettingsDTO';
import { DEFAULT_CURRENCY } from 'src/types/currency';
import SettingsRepository from '../settings.repository';

// The settings table holds exactly one row, pinned to this id.
const SETTINGS_ID = 1;

@Injectable()
export class DBSettingsRepository extends SettingsRepository<AppSettings> {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async get(): Promise<SettingsDTO> {
    const settings = await this.prismaService.appSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID, defaultCurrency: DEFAULT_CURRENCY },
    });

    return await Promise.resolve(this.toDTO(settings));
  }

  async update(props: UpdateSettingsDTO): Promise<SettingsDTO> {
    const settings = await this.prismaService.appSettings.upsert({
      where: { id: SETTINGS_ID },
      update: { ...props },
      create: {
        id: SETTINGS_ID,
        defaultCurrency: props.defaultCurrency ?? DEFAULT_CURRENCY,
      },
    });

    return await Promise.resolve(this.toDTO(settings));
  }

  toDTO(settings: AppSettings): SettingsDTO {
    return {
      id: settings.id,
      defaultCurrency: settings.defaultCurrency,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
