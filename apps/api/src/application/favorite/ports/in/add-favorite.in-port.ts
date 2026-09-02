export interface AddFavoriteInPort {
  execute(userId: string, code: string): Promise<void>;
}
