import { Injectable } from '@nestjs/common';
import { AppSettings } from 'generated/prisma';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import { isCurrency } from 'src/types/currency';
import SettingsDTO from 'src/types/settings/settingsDTO';
import UpdateSettingsDTO from 'src/types/settings/updateSettingsDTO';

@Injectable()
export class SettingsService {
  constructor(private readonly repository: SettingsRepository<AppSettings>) {}

  async get(): Promise<SettingsDTO> {
    return await this.repository.get();
  }

  async update(props: UpdateSettingsDTO): Promise<SettingsDTO> {
    if (
      props.defaultCurrency !== undefined &&
      !isCurrency(props.defaultCurrency)
    ) {
      throw new Error('Invalid currency');
    }

    return await this.repository.update(props);
  }
}
