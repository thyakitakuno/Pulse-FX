import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  BcbClientOutPort,
  BcbQuote,
} from '../../application/indicator/ports/out/bcb-client.out-port';

const CLOSING_BULLETIN = 'Fechamento';

interface BcbApiQuote {
  cotacaoVenda: number;
  dataHoraCotacao: string;
  tipoBoletim: string;
}

interface BcbApiResponse {
  value: BcbApiQuote[];
}

function toBcbDate(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

@Injectable()
export class BcbClient implements BcbClientOutPort {
  constructor(private readonly configService: ConfigService) {}

  async fetchClosingQuotes(
    currency: string,
    from: Date,
    to: Date,
  ): Promise<BcbQuote[]> {
    const baseUrl = this.configService.get<string>('BCB_BASE_URL');
    const url =
      `${baseUrl}/CotacaoMoedaPeriodo(moeda=@moeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
      `?@moeda='${currency}'&@dataInicial='${toBcbDate(from)}'&@dataFinalCotacao='${toBcbDate(to)}'&$format=json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`BCB PTAX request failed with status ${response.status}`);
    }

    const body = (await response.json()) as BcbApiResponse;

    return body.value
      .filter((quote) => quote.tipoBoletim === CLOSING_BULLETIN)
      .map((quote) => ({
        date: quote.dataHoraCotacao.slice(0, 10),
        value: quote.cotacaoVenda,
      }));
  }
}
