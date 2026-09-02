export interface BcbQuote {
  date: string;
  value: number;
}

export interface BcbClientOutPort {
  fetchClosingQuotes(
    currency: string,
    from: Date,
    to: Date,
  ): Promise<BcbQuote[]>;
}
