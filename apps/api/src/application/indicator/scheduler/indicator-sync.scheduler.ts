import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SyncFxRatesInPort } from '../ports/in/sync-fx-rates.in-port';
import { SyncMacroIndicatorsInPort } from '../ports/in/sync-macro-indicators.in-port';

@Injectable()
export class IndicatorSyncScheduler {
  private readonly logger = new Logger(IndicatorSyncScheduler.name);

  constructor(
    @Inject('SyncFxRatesInPort')
    private readonly syncFxRatesInPort: SyncFxRatesInPort,
    @Inject('SyncMacroIndicatorsInPort')
    private readonly syncMacroIndicatorsInPort: SyncMacroIndicatorsInPort,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleFxSync(): Promise<void> {
    const results = await this.syncFxRatesInPort.execute();
    this.logger.log(`FX: ${JSON.stringify(results)}`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleMacroSync(): Promise<void> {
    const results = await this.syncMacroIndicatorsInPort.execute();
    this.logger.log(`Macro: ${JSON.stringify(results)}`);
  }
}
