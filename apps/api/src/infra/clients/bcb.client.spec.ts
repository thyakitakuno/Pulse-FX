import { ConfigService } from '@nestjs/config';
import { BcbClient } from './bcb.client';

const TEST_BASE_URL =
  'https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata';

describe('BcbClient', () => {
  let client: BcbClient;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue(TEST_BASE_URL),
    } as unknown as ConfigService;
    client = new BcbClient(configService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should only keep the closing bulletin and map it to date/value', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            cotacaoVenda: 5.149,
            dataHoraCotacao: '2026-08-25 10:06:12.854962',
            tipoBoletim: 'Abertura',
          },
          {
            cotacaoVenda: 5.148,
            dataHoraCotacao: '2026-08-25 13:04:44.743388',
            tipoBoletim: 'Fechamento',
          },
        ],
      }),
    } as Response);

    const quotes = await client.fetchClosingQuotes(
      'USD',
      new Date('2026-08-25'),
      new Date('2026-08-25'),
    );

    expect(quotes).toEqual([{ date: '2026-08-25', value: 5.148 }]);
  });

  it('should build the request URL from BCB_BASE_URL, the currency and the date range (MM-DD-YYYY)', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ value: [] }),
    } as Response);

    await client.fetchClosingQuotes(
      'EUR',
      new Date(2026, 7, 25),
      new Date(2026, 7, 31),
    );

    const [requestedUrl] = fetchSpy.mock.calls[0];
    expect(requestedUrl).toContain(`${TEST_BASE_URL}/CotacaoMoedaPeriodo`);
    expect(requestedUrl).toContain("@moeda='EUR'");
    expect(requestedUrl).toContain("@dataInicial='08-25-2026'");
    expect(requestedUrl).toContain("@dataFinalCotacao='08-31-2026'");
  });

  it('should throw when the BCB API responds with a non-ok status', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 503 } as Response);

    await expect(
      client.fetchClosingQuotes(
        'USD',
        new Date('2026-08-25'),
        new Date('2026-08-25'),
      ),
    ).rejects.toThrow('BCB PTAX request failed with status 503');
  });
});
