import { IndicatorSummaryResDTO } from '../../../indicator/dto/response/indicator-summary.res.dto';

export interface ListFavoritesInPort {
  execute(userId: string): Promise<IndicatorSummaryResDTO[]>;
}
