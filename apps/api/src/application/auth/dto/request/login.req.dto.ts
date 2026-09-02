import { IsNotEmpty, IsString } from 'class-validator';

export class LoginReqDTO {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
