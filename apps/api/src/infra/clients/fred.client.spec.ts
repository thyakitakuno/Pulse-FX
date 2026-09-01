import { ConfigService } from '@nestjs/config';
import { FredClient } from './fred.client';

const TEST_BASE_URL = 'https://api.stlouisfed.org/fred';
const TEST_API_KEY = 'test-fred-api-key';

describe('FredClient', () => {
  let client: FredClient;
  let fetchSpy: jest.SpiedFunction<typeof fetch>;

  beforeEach(() => {
    const configService = {
      get: jest.fn((key: string) =>
        key === 'FRED_BASE_URL' ? TEST_BASE_URL : TEST_API_KEY,
      ),
    } as unknown as ConfigService;
    client = new FredClient(configService);
    fetchSpy = jest.spyOn(global, 'fetch');
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  it('should map observations to date/value, converting the value to a number', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [
          { date: '2026-06-01', value: '5.33' },
          { date: '2026-07-01', value: '5.08' },
        ],
      }),
    } as Response);

    const observations = await client.fetchObservations(
      'FEDFUNDS',
      new Date('2026-06-01'),
      new Date('2026-07-31'),
    );

    expect(observations).toEqual([
      { date: '2026-06-01', value: 5.33 },
      { date: '2026-07-01', value: 5.08 },
    ]);
  });

  it('should filter out missing values (FRED uses "." for gaps)', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({
        observations: [
          { date: '2026-06-01', value: '5.33' },
          { date: '2026-07-01', value: '.' },
        ],
      }),
    } as Response);

    const observations = await client.fetchObservations(
      'FEDFUNDS',
      new Date('2026-06-01'),
      new Date('2026-07-31'),
    );

    expect(observations).toEqual([{ date: '2026-06-01', value: 5.33 }]);
  });

  it('should build the request URL from FRED_BASE_URL, series id, api key and date range', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ observations: [] }),
    } as Response);

    await client.fetchObservations(
      'CPIAUCSL',
      new Date(2026, 5, 1),
      new Date(2026, 6, 31),
    );

    const [requestedUrl] = fetchSpy.mock.calls[0];
    expect(requestedUrl).toContain(`${TEST_BASE_URL}/series/observations`);
    expect(requestedUrl).toContain('series_id=CPIAUCSL');
    expect(requestedUrl).toContain(`api_key=${TEST_API_KEY}`);
    expect(requestedUrl).toContain('observation_start=2026-06-01');
    expect(requestedUrl).toContain('observation_end=2026-07-31');
  });

  it('should throw when the FRED API responds with a non-ok status', async () => {
    fetchSpy.mockResolvedValue({ ok: false, status: 400 } as Response);

    await expect(
      client.fetchObservations(
        'FEDFUNDS',
        new Date('2026-06-01'),
        new Date('2026-07-31'),
      ),
    ).rejects.toThrow('FRED request failed with status 400');
  });
});
