import SettingsDTO from 'src/types/settings/settingsDTO';
import UpdateSettingsDTO from 'src/types/settings/updateSettingsDTO';
import { Currency, DEFAULT_CURRENCY } from 'src/types/currency';
import SettingsRepository from '../settings.repository';

interface InMemoSettings {
  id: number;
  defaultCurrency: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export class InMemoSettingsRepository extends SettingsRepository<InMemoSettings> {
  private settings: InMemoSettings = {
    id: 1,
    defaultCurrency: DEFAULT_CURRENCY,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  async get(): Promise<SettingsDTO> {
    return await Promise.resolve(this.toDTO(this.settings));
  }

  async update(props: UpdateSettingsDTO): Promise<SettingsDTO> {
    this.settings = {
      ...this.settings,
      defaultCurrency: props.defaultCurrency ?? this.settings.defaultCurrency,
      updatedAt: new Date(),
    };

    return await Promise.resolve(this.toDTO(this.settings));
  }

  toDTO(settings: InMemoSettings): SettingsDTO {
    return {
      id: settings.id,
      defaultCurrency: settings.defaultCurrency,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString(),
    };
  }
}
