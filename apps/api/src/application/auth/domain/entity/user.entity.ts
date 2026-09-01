import { randomUUID } from 'node:crypto';
import { Username } from '../value-objects/username.vo';
import { UserRole } from '../../enums/user-role.enum';

interface UserData {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
}

interface CreateUserData {
  name: string;
  username: string;
  passwordHash: string;
  role?: UserRole;
}

export class User {
  private id: string;
  private name: string;
  private username: Username;
  private passwordHash: string;
  private role: UserRole;

  constructor({ id, name, username, passwordHash, role }: UserData) {
    this.id = id;
    this.name = name;
    this.username = new Username(username);
    this.passwordHash = passwordHash;
    this.role = role;
  }

  static create({
    name,
    username,
    passwordHash,
    role = UserRole.USER,
  }: CreateUserData): User {
    const usernameVO = Username.create(username);
    return new User({
      id: randomUUID(),
      name,
      username: usernameVO.getValue(),
      passwordHash,
      role,
    });
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getUsername(): string {
    return this.username.getValue();
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): UserRole {
    return this.role;
  }
}
