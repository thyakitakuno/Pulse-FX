import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/persistence/prisma.service';
import { FavoriteRepositoryOutPort } from '../ports/out/favorite-repository.out-port';

@Injectable()
export class FavoriteRepository implements FavoriteRepositoryOutPort {
  constructor(private readonly prisma: PrismaService) {}

  async add(userId: string, indicatorId: string): Promise<void> {
    await this.prisma.favorite.upsert({
      where: { userId_indicatorId: { userId, indicatorId } },
      update: {},
      create: { userId, indicatorId },
    });
  }

  async remove(userId: string, indicatorId: string): Promise<void> {
    await this.prisma.favorite.deleteMany({
      where: { userId, indicatorId },
    });
  }

  async listIndicatorIdsByUser(userId: string): Promise<string[]> {
    const records = await this.prisma.favorite.findMany({
      where: { userId },
      select: { indicatorId: true },
    });

    return records.map((record) => record.indicatorId);
  }
}
