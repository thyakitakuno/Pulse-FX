import { CookieOptions } from 'express';

export const AUTH_COOKIE_NAME = 'pulsefx_session';

export function authCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  };
}
