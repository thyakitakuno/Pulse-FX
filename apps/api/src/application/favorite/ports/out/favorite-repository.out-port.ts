export interface FavoriteRepositoryOutPort {
  add(userId: string, indicatorId: string): Promise<void>;
  remove(userId: string, indicatorId: string): Promise<void>;
  listIndicatorIdsByUser(userId: string): Promise<string[]>;
}
