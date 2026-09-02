import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../../common/guards/auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IndicatorDetailResDTO } from './dto/response/indicator-detail.res.dto';
import { IndicatorSummaryResDTO } from './dto/response/indicator-summary.res.dto';
import { GetDashboardInPort } from './ports/in/get-dashboard.in-port';
import { GetIndicatorDetailInPort } from './ports/in/get-indicator-detail.in-port';
import {
  SyncMacroIndicatorsInPort,
  SyncMacroIndicatorsResult,
} from './ports/in/sync-macro-indicators.in-port';
import {
  SyncFxRatesInPort,
  SyncFxRatesResult,
} from './ports/in/sync-fx-rates.in-port';

@Controller('indicators')
export class IndicatorController {
  constructor(
    @Inject('SyncFxRatesInPort')
    private readonly syncFxRatesInPort: SyncFxRatesInPort,
    @Inject('SyncMacroIndicatorsInPort')
    private readonly syncMacroIndicatorsInPort: SyncMacroIndicatorsInPort,
    @Inject('GetDashboardInPort')
    private readonly getDashboardInPort: GetDashboardInPort,
    @Inject('GetIndicatorDetailInPort')
    private readonly getIndicatorDetailInPort: GetIndicatorDetailInPort,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  async dashboard(): Promise<IndicatorSummaryResDTO[]> {
    return this.getDashboardInPort.execute();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':code')
  async detail(@Param('code') code: string): Promise<IndicatorDetailResDTO> {
    const detail = await this.getIndicatorDetailInPort.execute(code);
    if (!detail) {
      throw new NotFoundException(`Indicator ${code} not found`);
    }
    return detail;
  }

  @UseGuards(AuthGuard)
  @Post('sync/fx')
  @HttpCode(HttpStatus.OK)
  async syncFx(): Promise<SyncFxRatesResult[]> {
    return this.syncFxRatesInPort.execute();
  }

  @UseGuards(AuthGuard)
  @Post('sync/macro')
  @HttpCode(HttpStatus.OK)
  async syncMacro(): Promise<SyncMacroIndicatorsResult[]> {
    return this.syncMacroIndicatorsInPort.execute();
  }
}
