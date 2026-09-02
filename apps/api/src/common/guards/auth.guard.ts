import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard as PassportJwtGuard } from '@nestjs/passport';
import { UserRole } from '../../application/auth/enums/user-role.enum';

@Injectable()
export class AuthGuard extends PassportJwtGuard('jwt') {
  constructor(private readonly configService: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const expectedApiKey = this.configService.get<string>('API_KEY');

    if (apiKey && expectedApiKey && apiKey === expectedApiKey) {
      request.user = { sub: 'api-key', role: UserRole.ADMIN };
      return true;
    }

    return super.canActivate(context) as boolean | Promise<boolean>;
  }
}
