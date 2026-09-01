import { Inject, Injectable, Logger } from '@nestjs/common';
import { FX_INDICATORS } from '../config/fx-indicators.config';
import { IndicatorFrequency } from '../enums/indicator-frequency.enum';
import { IndicatorSource } from '../enums/indicator-source.enum';
import {
  SyncFxRatesInPort,
  SyncFxRatesResult,
} from '../ports/in/sync-fx-rates.in-port';
import { BcbClientOutPort } from '../ports/out/bcb-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

const SYNC_WINDOW_DAYS = 30;

@Injectable()
export class SyncFxRatesUseCase implements SyncFxRatesInPort {
  private readonly logger = new Logger(SyncFxRatesUseCase.name);

  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    @Inject('BcbClientOutPort')
    private readonly bcbClient: BcbClientOutPort,
  ) {}

  async execute(): Promise<SyncFxRatesResult[]> {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - SYNC_WINDOW_DAYS);

    const results: SyncFxRatesResult[] = [];

    for (const fxIndicator of FX_INDICATORS) {
      const indicatorId = await this.indicatorRepository.upsertCatalogEntry({
        code: fxIndicator.code,
        name: fxIndicator.name,
        source: IndicatorSource.BCB,
        frequency: IndicatorFrequency.DAILY,
        unit: 'BRL',
        description: fxIndicator.description,
        limitations: fxIndicator.limitations,
      });

      const quotes = await this.bcbClient.fetchClosingQuotes(
        fxIndicator.currency,
        from,
        to,
      );
      const observationsSynced =
        await this.indicatorRepository.upsertObservations(indicatorId, quotes);

      this.logger.log(
        `Synced ${observationsSynced} observations for ${fxIndicator.code}`,
      );
      results.push({ code: fxIndicator.code, observationsSynced });
    }

    return results;
  }
}
