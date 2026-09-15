import SettingsDTO from 'src/types/settings/settingsDTO';
import UpdateSettingsDTO from 'src/types/settings/updateSettingsDTO';

export default abstract class SettingsRepository<Entity> {
  // Reads the single settings row, creating it with defaults on first access
  // so the API never has to answer with "not configured yet".
  abstract get(): Promise<SettingsDTO>;
  abstract update(props: UpdateSettingsDTO): Promise<SettingsDTO>;

  abstract toDTO(settings: Entity): SettingsDTO;
}
