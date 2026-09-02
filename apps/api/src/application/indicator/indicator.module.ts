import { Module } from '@nestjs/common';
import { BcbClient } from '../../infra/clients/bcb.client';
import { FredClient } from '../../infra/clients/fred.client';
import { IndicatorStartupSyncService } from './bootstrap/indicator-startup-sync.service';
import { IndicatorSummaryBuilderService } from './domain/service/indicator-summary-builder.service';
import { VariationCalculatorService } from './domain/service/variation-calculator.service';
import { SyncPolicyService } from './domain/service/sync-policy.service';
import { IndicatorController } from './indicator.controller';
import { IndicatorRepository } from './repository/indicator.repository';
import { IndicatorSyncScheduler } from './scheduler/indicator-sync.scheduler';
import { GetDashboardUseCase } from './usecase/get-dashboard.usecase';
import { GetIndicatorDetailUseCase } from './usecase/get-indicator-detail.usecase';
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
    {
      provide: 'GetIndicatorDetailInPort',
      useClass: GetIndicatorDetailUseCase,
    },
    VariationCalculatorService,
    IndicatorSummaryBuilderService,
    SyncPolicyService,
    IndicatorSyncScheduler,
    IndicatorStartupSyncService,
  ],
  exports: ['IndicatorRepositoryOutPort', IndicatorSummaryBuilderService],
})
export class IndicatorModule {}
