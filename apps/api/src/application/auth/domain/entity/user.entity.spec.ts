import { UserRole } from '../../enums/user-role.enum';
import { User } from './user.entity';

describe('User', () => {
  it('should rebuild a user from persisted data', () => {
    const user = new User({
      id: 'user-id',
      name: 'Paul Julius Reuter',
      username: 'paul',
      passwordHash: 'hashed-value',
      role: UserRole.ADMIN,
    });

    expect(user.getId()).toBe('user-id');
    expect(user.getName()).toBe('Paul Julius Reuter');
    expect(user.getUsername()).toBe('paul');
    expect(user.getPasswordHash()).toBe('hashed-value');
    expect(user.getRole()).toBe(UserRole.ADMIN);
  });
});
