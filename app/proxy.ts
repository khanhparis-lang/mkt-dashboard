/* Chặn trước khi trang render: chưa đăng nhập (hoặc email đã bị gỡ khỏi ALLOWED_EMAILS)
   → /dashboard chuyển về /login, /api/data trả 401. Đã đăng nhập mà mở /login → vào thẳng dashboard.
   Next 16: file này thay cho middleware.ts, chạy trên Node runtime nên dùng được node:crypto. */
import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, readSession } from '@/lib/auth';

export function proxy(req: NextRequest) {
  const user = readSession(req.cookies.get(SESSION_COOKIE)?.value);
  const { pathname, search } = req.nextUrl;

  if (pathname === '/login') {
    return user ? NextResponse.redirect(new URL('/dashboard', req.url)) : NextResponse.next();
  }
  if (user) return NextResponse.next();

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Chưa đăng nhập', hint: 'Đăng nhập bằng Google ở /login.' }, { status: 401 });
  }
  const login = new URL('/login', req.url);
  login.searchParams.set('next', pathname + search);
  const res = NextResponse.redirect(login);
  // cookie hỏng/hết hạn/email bị gỡ: xoá luôn để không kiểm tra lại mỗi lần
  if (req.cookies.has(SESSION_COOKIE)) res.cookies.delete(SESSION_COOKIE);
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/data/:path*', '/login'],
};
