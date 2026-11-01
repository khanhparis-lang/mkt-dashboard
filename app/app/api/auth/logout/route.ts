/* POST /api/auth/logout — xoá phiên rồi về trang đăng nhập.
   Chỉ nhận POST (form), để một link/ảnh lạ không đăng xuất được người dùng. */
import { NextResponse } from 'next/server';
import { DENIED_COOKIE, SESSION_COOKIE, originOf } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export function POST(req: Request) {
  const res = NextResponse.redirect(new URL('/login?loggedout=1', originOf(req)), 303);
  res.cookies.delete(SESSION_COOKIE);
  res.cookies.delete(DENIED_COOKIE);
  return res;
}
