import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IndicatorRepositoryOutPort } from '../../indicator/ports/out/indicator-repository.out-port';
import { RemoveFavoriteInPort } from '../ports/in/remove-favorite.in-port';
import { FavoriteRepositoryOutPort } from '../ports/out/favorite-repository.out-port';

@Injectable()
export class RemoveFavoriteUseCase implements RemoveFavoriteInPort {
  constructor(
    @Inject('IndicatorRepositoryOutPort')
    private readonly indicatorRepository: IndicatorRepositoryOutPort,
    @Inject('FavoriteRepositoryOutPort')
    private readonly favoriteRepository: FavoriteRepositoryOutPort,
  ) {}

  async execute(userId: string, code: string): Promise<void> {
    const indicator = await this.indicatorRepository.findByCode(code);
    if (!indicator) {
      throw new NotFoundException(`Indicator ${code} not found`);
    }

    await this.favoriteRepository.remove(userId, indicator.id);
  }
}
