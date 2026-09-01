export interface FredObservation {
  date: string;
  value: number;
}

export interface FredClientOutPort {
  fetchObservations(
    seriesId: string,
    from: Date,
    to: Date,
  ): Promise<FredObservation[]>;
}
