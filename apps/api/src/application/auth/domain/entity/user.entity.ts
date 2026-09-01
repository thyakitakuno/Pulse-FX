import { UserRole } from '../../enums/user-role.enum';

export interface User {
  id: string;
  name: string;
  username: string;
  passwordHash: string;
  role: UserRole;
}
