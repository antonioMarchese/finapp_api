import { Test, TestingModule } from '@nestjs/testing';
import { SettingsService } from './settings.service';
import SettingsRepository from 'src/domain/repositories/settings.repository';
import { InMemoSettingsRepository } from 'src/domain/repositories/memo/memo.settings.repository';

describe('SettingsService', () => {
  let service: SettingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        {
          provide: SettingsRepository,
          useValue: new InMemoSettingsRepository(),
        },
      ],
    }).compile();

    service = module.get<SettingsService>(SettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the default currency before anything is configured', async () => {
    const settings = await service.get();

    expect(settings.defaultCurrency).toBe('BRL');
  });

  it('should update the default currency', async () => {
    const settings = await service.update({ defaultCurrency: 'USD' });

    expect(settings.defaultCurrency).toBe('USD');
    expect((await service.get()).defaultCurrency).toBe('USD');
  });

  it('should reject a currency outside the supported list', async () => {
    await expect(
      service.update({ defaultCurrency: 'JPY' as never }),
    ).rejects.toThrow('Invalid currency');
  });

  it('should keep the current currency when the payload is empty', async () => {
    await service.update({ defaultCurrency: 'EUR' });
    const settings = await service.update({});

    expect(settings.defaultCurrency).toBe('EUR');
  });
});
