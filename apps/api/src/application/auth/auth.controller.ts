import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AUTH_COOKIE_NAME, authCookieOptions } from './auth-cookie';
import { LoginReqDTO } from './dto/request/login.req.dto';
import { LoginResDTO } from './dto/response/login.res.dto';
import { LoginInPort } from './ports/in/login.in-port';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject('LoginInPort')
    private readonly loginInPort: LoginInPort,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginReqDTO,
    @Res({ passthrough: true }) response: Response,
  ): Promise<LoginResDTO> {
    const result = await this.loginInPort.execute(dto);
    response.cookie(AUTH_COOKIE_NAME, result.accessToken, authCookieOptions());
    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
  }
}
