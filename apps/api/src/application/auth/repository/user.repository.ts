import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infra/persistence/prisma.service';
import { User } from '../domain/entity/user.entity';
import { UserRepositoryOutPort } from '../ports/out/user-repository.out-port';

@Injectable()
export class UserRepository implements UserRepositoryOutPort {
  constructor(private readonly prisma: PrismaService) {}

  async findByUsername(username: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({ where: { username } });
    if (!record) {
      return null;
    }

    return new User({
      id: record.id,
      name: record.name,
      username: record.username,
      passwordHash: record.password,
      role: record.role,
    });
  }
}
