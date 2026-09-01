import { UserRole } from '../../enums/user-role.enum';

interface UserData {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
}

export class User {
  private id: string;
  private name: string;
  private username: string;
  private passwordHash: string;
  private role: UserRole;

  constructor({ id, name, username, passwordHash, role }: UserData) {
    this.id = id;
    this.name = name;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role;
  }

  getId(): string {
    return this.id;
  }

  getName(): string {
    return this.name;
  }

  getUsername(): string {
    return this.username;
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }

  getRole(): UserRole {
    return this.role;
  }
}
