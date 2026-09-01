import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  FredClientOutPort,
  FredObservation,
} from '../../application/indicator/ports/out/fred-client.out-port';

const MISSING_VALUE = '.';

interface FredApiObservation {
  date: string;
  value: string;
}

interface FredApiResponse {
  observations: FredApiObservation[];
}

function toFredDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class FredClient implements FredClientOutPort {
  constructor(private readonly configService: ConfigService) {}

  async fetchObservations(
    seriesId: string,
    from: Date,
    to: Date,
  ): Promise<FredObservation[]> {
    const baseUrl = this.configService.get<string>('FRED_BASE_URL');
    const apiKey = this.configService.get<string>('FRED_API_KEY');

    const url =
      `${baseUrl}/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json` +
      `&observation_start=${toFredDate(from)}&observation_end=${toFredDate(to)}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`FRED request failed with status ${response.status}`);
    }

    const body = (await response.json()) as FredApiResponse;

    return body.observations
      .filter((observation) => observation.value !== MISSING_VALUE)
      .map((observation) => ({
        date: observation.date,
        value: Number(observation.value),
      }));
  }
}
