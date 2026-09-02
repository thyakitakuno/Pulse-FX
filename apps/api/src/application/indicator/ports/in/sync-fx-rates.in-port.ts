export interface SyncFxRatesResult {
  code: string;
  status: 'synced' | 'skipped';
  observationsSynced: number;
}

export interface SyncFxRatesInPort {
  execute(): Promise<SyncFxRatesResult[]>;
}
