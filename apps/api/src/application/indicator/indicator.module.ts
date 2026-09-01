import { Module } from '@nestjs/common';
import { BcbClient } from '../../infra/clients/bcb.client';
import { FredClient } from '../../infra/clients/fred.client';
import { VariationCalculatorService } from './domain/service/variation-calculator.service';
import { IndicatorController } from './indicator.controller';
import { IndicatorRepository } from './repository/indicator.repository';
import { GetDashboardUseCase } from './usecase/get-dashboard.usecase';
import { SyncFxRatesUseCase } from './usecase/sync-fx-rates.usecase';
import { SyncMacroIndicatorsUseCase } from './usecase/sync-macro-indicators.usecase';

@Module({
  controllers: [IndicatorController],
  providers: [
    { provide: 'IndicatorRepositoryOutPort', useClass: IndicatorRepository },
    { provide: 'BcbClientOutPort', useClass: BcbClient },
    { provide: 'FredClientOutPort', useClass: FredClient },
    { provide: 'SyncFxRatesInPort', useClass: SyncFxRatesUseCase },
    {
      provide: 'SyncMacroIndicatorsInPort',
      useClass: SyncMacroIndicatorsUseCase,
    },
    { provide: 'GetDashboardInPort', useClass: GetDashboardUseCase },
    VariationCalculatorService,
  ],
})
export class IndicatorModule {}
