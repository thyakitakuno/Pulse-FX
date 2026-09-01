import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import {
  LoginInPort,
  LoginInput,
  LoginOutput,
} from '../ports/in/login.in-port';
import { UserRepositoryOutPort } from '../ports/out/user-repository.out-port';

@Injectable()
export class LoginUseCase implements LoginInPort {
  constructor(
    @Inject('UserRepositoryOutPort')
    private readonly userRepository: UserRepositoryOutPort,
    private readonly jwtService: JwtService,
  ) {}

  async execute({ username, password }: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await argon2.verify(
      user.getPasswordHash(),
      password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.getId(),
      username: user.getUsername(),
      role: user.getRole(),
    });

    return { accessToken };
  }
}
