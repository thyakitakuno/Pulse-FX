export interface SyncFxRatesResult {
  code: string;
  observationsSynced: number;
}

export interface SyncFxRatesInPort {
  execute(): Promise<SyncFxRatesResult[]>;
}
