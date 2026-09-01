import { BadRequestException } from '@nestjs/common';
import { UserRole } from '../../enums/user-role.enum';
import { User } from './user.entity';

describe('User', () => {
  it('deve criar um usuário com role padrão USER quando não informada', () => {
    const user = User.create({
      name: 'Jane Doe',
      username: 'jane',
      passwordHash: 'hashed-value',
    });

    expect(user.getName()).toBe('Jane Doe');
    expect(user.getUsername()).toBe('jane');
    expect(user.getRole()).toBe(UserRole.USER);
    expect(user.getId()).toEqual(expect.any(String));
  });

  it('deve criar um usuário com a role informada', () => {
    const user = User.create({
      name: 'Paul Julius Reuter',
      username: 'paul',
      passwordHash: 'hashed-value',
      role: UserRole.ADMIN,
    });

    expect(user.getRole()).toBe(UserRole.ADMIN);
  });

  it('deve lançar erro ao criar usuário com username inválido', () => {
    expect(() =>
      User.create({
        name: 'Invalid',
        username: 'ab',
        passwordHash: 'hashed-value',
      }),
    ).toThrow(BadRequestException);
  });
});
