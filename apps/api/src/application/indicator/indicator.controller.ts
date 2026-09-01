import {
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import {
  SyncFxRatesInPort,
  SyncFxRatesResult,
} from './ports/in/sync-fx-rates.in-port';

@Controller('indicators')
export class IndicatorController {
  constructor(
    @Inject('SyncFxRatesInPort')
    private readonly syncFxRatesInPort: SyncFxRatesInPort,
  ) {}

  @UseGuards(AuthGuard)
  @Post('sync/fx')
  @HttpCode(HttpStatus.OK)
  async syncFx(): Promise<SyncFxRatesResult[]> {
    return this.syncFxRatesInPort.execute();
  }
}
