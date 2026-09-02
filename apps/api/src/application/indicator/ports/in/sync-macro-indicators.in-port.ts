export interface SyncMacroIndicatorsResult {
  code: string;
  status: 'synced' | 'skipped';
  observationsSynced: number;
}

export interface SyncMacroIndicatorsInPort {
  execute(): Promise<SyncMacroIndicatorsResult[]>;
}
