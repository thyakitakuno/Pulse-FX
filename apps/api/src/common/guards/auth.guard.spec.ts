import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '../../application/auth/enums/user-role.enum';
import { AuthGuard } from './auth.guard';

function createContext(headers: Record<string, string>): ExecutionContext {
  const request: { headers: Record<string, string>; user?: unknown } = {
    headers,
  };

  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  it('should authorize and mark the user as ADMIN when the x-api-key header matches', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('expected-api-key'),
    } as unknown as ConfigService;
    const guard = new AuthGuard(configService);

    const context = createContext({ 'x-api-key': 'expected-api-key' });

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const request = context.switchToHttp().getRequest();
    expect(request.user).toEqual({ sub: 'api-key', role: UserRole.ADMIN });
  });

  it('should not authorize via API_KEY when the header does not match', async () => {
    const configService = {
      get: jest.fn().mockReturnValue('expected-api-key'),
    } as unknown as ConfigService;
    const guard = new AuthGuard(configService);

    const context = createContext({ 'x-api-key': 'wrong-key' });

    const superCanActivate = jest
      .spyOn(Object.getPrototypeOf(Object.getPrototypeOf(guard)), 'canActivate')
      .mockReturnValue(false);

    const result = await guard.canActivate(context);

    expect(superCanActivate).toHaveBeenCalledWith(context);
    expect(result).toBe(false);
  });
});
