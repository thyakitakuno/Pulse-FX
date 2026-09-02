import { IndicatorDetailResDTO } from '../../dto/response/indicator-detail.res.dto';

export interface GetIndicatorDetailInPort {
  execute(code: string): Promise<IndicatorDetailResDTO | null>;
}
