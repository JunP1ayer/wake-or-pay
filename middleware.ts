import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] Processing request:', pathname);

  // ルートアクセスのみ /jp にリダイレクト
  if (pathname === '/') {
    console.log('[Middleware] Redirecting / to /jp');
    const url = request.nextUrl.clone();
    url.pathname = '/jp';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],  // ルートのみ
}