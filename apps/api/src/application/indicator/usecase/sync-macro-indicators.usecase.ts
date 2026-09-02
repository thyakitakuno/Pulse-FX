import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MACRO_INDICATORS } from '../config/macro-indicators.config';
import { SyncPolicyService } from '../domain/service/sync-policy.service';
import { IndicatorFrequency } from '../enums/indicator-frequency.enum';
import { IndicatorSource } from '../enums/indicator-source.enum';
import {
  SyncMacroIndicatorsInPort,
  SyncMacroIndicatorsResult,
} from '../ports/in/sync-macro-indicators.in-port';
import { FredClientOutPort } from '../ports/out/fred-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

const SYNC_WINDOW_DAYS = 400;
const DEFAULT_TTL_MINUTES = 1440;

@Injectable()
export class SyncMacroIndicatorsUseCase implements SyncMacroIndicatorsInPort {
  private readonly logger = new Logger(SyncMacroIndicatorsUseCase.name);

  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    @Inject('FredClientOutPort')
    private readonly fredClient: FredClientOutPort,
    private readonly syncPolicy: SyncPolicyService,
    private readonly configService: ConfigService,
  ) {}

  async execute(): Promise<SyncMacroIndicatorsResult[]> {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - SYNC_WINDOW_DAYS);

    const ttlMinutes = Number(
      this.configService.get('MACRO_SYNC_TTL_MINUTES', DEFAULT_TTL_MINUTES),
    );

    const results: SyncMacroIndicatorsResult[] = [];

    for (const macroIndicator of MACRO_INDICATORS) {
      const lastSyncedAt = await this.indicatorRepository.findLastSyncedAt(
        macroIndicator.code,
      );

      if (!this.syncPolicy.isDue(lastSyncedAt, ttlMinutes)) {
        this.logger.log(
          `Skipping ${macroIndicator.code}: synced recently (TTL not expired)`,
        );
        results.push({
          code: macroIndicator.code,
          status: 'skipped',
          observationsSynced: 0,
        });
        continue;
      }

      const indicatorId = await this.indicatorRepository.upsertCatalogEntry({
        code: macroIndicator.code,
        name: macroIndicator.name,
        source: IndicatorSource.FRED,
        frequency: IndicatorFrequency.MONTHLY,
        unit: macroIndicator.unit,
        description: macroIndicator.description,
        limitations: macroIndicator.limitations,
      });

      const observations = await this.fredClient.fetchObservations(
        macroIndicator.seriesId,
        from,
        to,
      );
      const observationsSynced =
        await this.indicatorRepository.upsertObservations(
          indicatorId,
          observations,
        );

      this.logger.log(
        `Synced ${observationsSynced} observations for ${macroIndicator.code}`,
      );
      results.push({
        code: macroIndicator.code,
        status: 'synced',
        observationsSynced,
      });
    }

    return results;
  }
}
