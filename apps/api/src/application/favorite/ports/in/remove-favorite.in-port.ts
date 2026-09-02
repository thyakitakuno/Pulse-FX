export interface RemoveFavoriteInPort {
  execute(userId: string, code: string): Promise<void>;
}
