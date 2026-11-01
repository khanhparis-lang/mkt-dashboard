/* GET /api/auth/login?next=/dashboard → chuyển sang trang chọn tài khoản Google. */
import { NextResponse } from 'next/server';
import { FLOW_COOKIE, DENIED_COOKIE, missingAuthEnv, originOf, safeNext, startFlow } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export function GET(req: Request) {
  const origin = originOf(req);
  if (missingAuthEnv().length) return NextResponse.redirect(new URL('/login?error=config', origin));

  const { url, cookie } = startFlow(origin, safeNext(new URL(req.url).searchParams.get('next')));
  const res = NextResponse.redirect(url);
  res.cookies.set(FLOW_COOKIE, cookie, {
    httpOnly: true, sameSite: 'lax', secure: origin.startsWith('https:'), path: '/', maxAge: 600,
  });
  res.cookies.delete(DENIED_COOKIE);
  return res;
}
