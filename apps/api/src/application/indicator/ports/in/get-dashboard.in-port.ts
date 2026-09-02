import { IndicatorSummaryResDTO } from '../../dto/response/indicator-summary.res.dto';

export interface GetDashboardInPort {
  execute(): Promise<IndicatorSummaryResDTO[]>;
}
