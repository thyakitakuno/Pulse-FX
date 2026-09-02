import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportJwtGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends PassportJwtGuard('jwt') {}
