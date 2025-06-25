import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import crypto from 'crypto';

export function middleware(request: NextRequest) {
  const isProduction = process.env.NODE_ENV === 'production';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '[invalid url, do not cite]';
  
  // Tạo nonce
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Đặt CSP header
  const scriptSrc = isProduction
    ? `'self' https://esm.sh 'nonce-${nonce}' 'strict-dynamic'`
    : `'self' 'unsafe-eval' 'unsafe-inline' https://esm.sh 'nonce-${nonce}' 'strict-dynamic'`;
  const csp = `default-src 'self'; script-src ${scriptSrc}; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' https://api.neynar.com https://mainnet.infura.io wss://mainnet.infura.io ${baseUrl};`;
  
  // Xử lý yêu cầu OPTIONS cho CORS
  if (request.method === 'OPTIONS') {
    console.log('[Middleware] Handling OPTIONS request for:', request.url);
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Content-Security-Policy': csp,
        'Set-Cookie': `csp-nonce=${nonce}; Path=/; HttpOnly; SameSite=Strict`,
      },
    });
  }
  
  // Cho các yêu cầu khác
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Content-Security-Policy', csp);
  response.cookies.set('csp-nonce', nonce, { path: '/', httpOnly: false, sameSite: 'strict' });
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};