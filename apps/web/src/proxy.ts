import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'pulsefx_session';
const PROTECTED_PATHS = ['/dashboard', '/favorites', '/indicators'];

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/favorites/:path*',
    '/indicators/:path*',
    '/login',
  ],
};
