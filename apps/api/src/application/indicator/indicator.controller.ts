import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { IndicatorSummaryResDTO } from './dto/response/indicator-summary.res.dto';
import { GetDashboardInPort } from './ports/in/get-dashboard.in-port';
import {
  SyncFxRatesInPort,
  SyncFxRatesResult,
} from './ports/in/sync-fx-rates.in-port';

@Controller('indicators')
export class IndicatorController {
  constructor(
    @Inject('SyncFxRatesInPort')
    private readonly syncFxRatesInPort: SyncFxRatesInPort,
    @Inject('GetDashboardInPort')
    private readonly getDashboardInPort: GetDashboardInPort,
  ) {}

  @Get()
  async dashboard(): Promise<IndicatorSummaryResDTO[]> {
    return this.getDashboardInPort.execute();
  }

  @UseGuards(AuthGuard)
  @Post('sync/fx')
  @HttpCode(HttpStatus.OK)
  async syncFx(): Promise<SyncFxRatesResult[]> {
    return this.syncFxRatesInPort.execute();
  }
}
