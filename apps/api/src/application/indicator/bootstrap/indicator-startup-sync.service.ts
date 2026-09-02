import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SyncFxRatesInPort } from '../ports/in/sync-fx-rates.in-port';
import { SyncMacroIndicatorsInPort } from '../ports/in/sync-macro-indicators.in-port';

@Injectable()
export class IndicatorStartupSyncService implements OnApplicationBootstrap {
  private readonly logger = new Logger(IndicatorStartupSyncService.name);

  constructor(
    @Inject('SyncFxRatesInPort')
    private readonly syncFxRatesInPort: SyncFxRatesInPort,
    @Inject('SyncMacroIndicatorsInPort')
    private readonly syncMacroIndicatorsInPort: SyncMacroIndicatorsInPort,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.configService.get('SYNC_ON_STARTUP') !== 'true') {
      return;
    }

    try {
      const fxResults = await this.syncFxRatesInPort.execute();
      this.logger.log(`Startup FX sync: ${JSON.stringify(fxResults)}`);
    } catch (error) {
      this.logger.error('Startup FX sync failed', error);
    }

    try {
      const macroResults = await this.syncMacroIndicatorsInPort.execute();
      this.logger.log(`Startup macro sync: ${JSON.stringify(macroResults)}`);
    } catch (error) {
      this.logger.error('Startup macro sync failed', error);
    }
  }
}
