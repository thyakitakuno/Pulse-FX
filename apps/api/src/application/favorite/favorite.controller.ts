import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { IndicatorSummaryResDTO } from '../indicator/dto/response/indicator-summary.res.dto';
import { AddFavoriteInPort } from './ports/in/add-favorite.in-port';
import { ListFavoritesInPort } from './ports/in/list-favorites.in-port';
import { RemoveFavoriteInPort } from './ports/in/remove-favorite.in-port';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoriteController {
  constructor(
    @Inject('AddFavoriteInPort')
    private readonly addFavoriteInPort: AddFavoriteInPort,
    @Inject('RemoveFavoriteInPort')
    private readonly removeFavoriteInPort: RemoveFavoriteInPort,
    @Inject('ListFavoritesInPort')
    private readonly listFavoritesInPort: ListFavoritesInPort,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<IndicatorSummaryResDTO[]> {
    return this.listFavoritesInPort.execute(user.sub);
  }

  @Post(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async add(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code') code: string,
  ): Promise<void> {
    await this.addFavoriteInPort.execute(user.sub, code);
  }

  @Delete(':code')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('code') code: string,
  ): Promise<void> {
    await this.removeFavoriteInPort.execute(user.sub, code);
  }
}
