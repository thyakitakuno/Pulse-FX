import { Module } from '@nestjs/common';
import { BcbClient } from '../../infra/clients/bcb.client';
import { VariationCalculatorService } from './domain/service/variation-calculator.service';
import { IndicatorController } from './indicator.controller';
import { IndicatorRepository } from './repository/indicator.repository';
import { SyncFxRatesUseCase } from './usecase/sync-fx-rates.usecase';

@Module({
  controllers: [IndicatorController],
  providers: [
    { provide: 'IndicatorRepositoryOutPort', useClass: IndicatorRepository },
    { provide: 'BcbClientOutPort', useClass: BcbClient },
    { provide: 'SyncFxRatesInPort', useClass: SyncFxRatesUseCase },
    VariationCalculatorService,
  ],
})
export class IndicatorModule {}
