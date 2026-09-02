import { User } from '../../domain/entity/user.entity';

export interface UserRepositoryOutPort {
  findByUsername(username: string): Promise<User | null>;
}
