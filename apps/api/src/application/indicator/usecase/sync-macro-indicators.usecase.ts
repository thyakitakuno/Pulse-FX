import { Inject, Injectable, Logger } from '@nestjs/common';
import { MACRO_INDICATORS } from '../config/macro-indicators.config';
import { IndicatorFrequency } from '../enums/indicator-frequency.enum';
import { IndicatorSource } from '../enums/indicator-source.enum';
import {
  SyncMacroIndicatorsInPort,
  SyncMacroIndicatorsResult,
} from '../ports/in/sync-macro-indicators.in-port';
import { FredClientOutPort } from '../ports/out/fred-client.out-port';
import { IndicatorRepositoryOutPort } from '../ports/out/indicator-repository.out-port';

// Janela maior que a do FX (30 dias): séries mensais publicam ~1 ponto por mês, então
// buscamos ~13 meses pra ter histórico suficiente pra regra de variação e pra tela de
// detalhe, mesmo com a defasagem de publicação do FRED.
const SYNC_WINDOW_DAYS = 400;

@Injectable()
export class SyncMacroIndicatorsUseCase implements SyncMacroIndicatorsInPort {
  private readonly logger = new Logger(SyncMacroIndicatorsUseCase.name);

  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    @Inject('FredClientOutPort')
    private readonly fredClient: FredClientOutPort,
  ) {}

  async execute(): Promise<SyncMacroIndicatorsResult[]> {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - SYNC_WINDOW_DAYS);

    const results: SyncMacroIndicatorsResult[] = [];

    for (const macroIndicator of MACRO_INDICATORS) {
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
      results.push({ code: macroIndicator.code, observationsSynced });
    }

    return results;
  }
}
