export interface SyncMacroIndicatorsResult {
  code: string;
  observationsSynced: number;
}

export interface SyncMacroIndicatorsInPort {
  execute(): Promise<SyncMacroIndicatorsResult[]>;
}
