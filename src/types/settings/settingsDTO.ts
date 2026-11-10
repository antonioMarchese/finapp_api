import { Currency } from '../currency';

export default interface SettingsDTO {
  id: number;
  defaultCurrency: Currency;
  createdAt: string;
  updatedAt: string;
}
