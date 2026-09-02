import { Module } from '@nestjs/common';
import { IndicatorModule } from '../indicator/indicator.module';
import { FavoriteController } from './favorite.controller';
import { FavoriteRepository } from './repository/favorite.repository';
import { AddFavoriteUseCase } from './usecase/add-favorite.usecase';
import { ListFavoritesUseCase } from './usecase/list-favorites.usecase';
import { RemoveFavoriteUseCase } from './usecase/remove-favorite.usecase';

@Module({
  imports: [IndicatorModule],
  controllers: [FavoriteController],
  providers: [
    { provide: 'FavoriteRepositoryOutPort', useClass: FavoriteRepository },
    { provide: 'AddFavoriteInPort', useClass: AddFavoriteUseCase },
    { provide: 'RemoveFavoriteInPort', useClass: RemoveFavoriteUseCase },
    { provide: 'ListFavoritesInPort', useClass: ListFavoritesUseCase },
  ],
})
export class FavoriteModule {}
