/* GET /api/auth/callback/google — Google trả người dùng về đây sau khi chọn tài khoản.
   Email trong ALLOWED_EMAILS → tạo phiên, vào dashboard.
   Email ngoài danh sách     → KHÔNG tạo phiên, về /login kèm thông báo không có quyền. */
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  AuthError, DENIED_COOKIE, ERROR_COOKIE, FLOW_COOKIE, SESSION_COOKIE,
  createSession, finishFlow, isAllowed, originOf,
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const origin = originOf(req);
  const secure = origin.startsWith('https:');
  const jar = await cookies();
  const flow = jar.get(FLOW_COOKIE)?.value;

  try {
    const { user, next } = await finishFlow(origin, new URL(req.url).searchParams, flow);

    if (!isAllowed(user.email)) {
      const res = NextResponse.redirect(new URL('/login?error=denied', origin));
      res.cookies.delete(FLOW_COOKIE);
      res.cookies.delete(SESSION_COOKIE);
      // email chỉ nằm trong cookie ngắn hạn, không đưa lên URL
      res.cookies.set(DENIED_COOKIE, user.email, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 300 });
      return res;
    }

    const s = createSession(user);
    const res = NextResponse.redirect(new URL(next, origin));
    res.cookies.delete(FLOW_COOKIE);
    res.cookies.delete(DENIED_COOKIE);
    res.cookies.set(SESSION_COOKIE, s.value, { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: s.maxAge });
    return res;
  } catch (e) {
    const msg = e instanceof AuthError ? e.message : 'Đăng nhập không thành công, vui lòng thử lại.';
    if (!(e instanceof AuthError)) console.error('[auth] callback error:', e);
    // Câu lỗi đi qua cookie ngắn hạn, không qua URL: link ?msg=... có thể bị dùng để chèn chữ giả lên trang login.
    const res = NextResponse.redirect(new URL('/login?error=failed', origin));
    res.cookies.delete(FLOW_COOKIE);
    res.cookies.set(ERROR_COOKIE, encodeURIComponent(msg), { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 120 });
    return res;
  }
}
