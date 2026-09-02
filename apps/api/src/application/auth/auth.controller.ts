import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
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
  async login(@Body() dto: LoginReqDTO): Promise<LoginResDTO> {
    return this.loginInPort.execute(dto);
  }
}
