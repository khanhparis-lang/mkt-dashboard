/* Đăng nhập Google (OAuth 2.0 / OpenID Connect, luồng authorization code + PKCE).
   Không dùng thư viện: chỉ fetch + node:crypto, nên không phụ thuộc phiên bản Next.

   Biến trong app/.env.local (tắt và chạy lại npm run dev sau khi sửa):
     AUTH_GOOGLE_ID      OAuth Client ID (Google Cloud Console → Credentials, loại "Web application")
     AUTH_GOOGLE_SECRET  OAuth Client secret
     ALLOWED_EMAILS      danh sách email được vào, cách nhau bằng dấu phẩy
     AUTH_SECRET         chuỗi ngẫu nhiên để ký cookie phiên (đổi chuỗi = mọi người phải đăng nhập lại)

   Redirect URI phải khai trong Google Cloud Console: <origin>/api/auth/callback/google
   (vd http://localhost:3000/api/auth/callback/google). */
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

export type SessionUser = { email: string; name: string; picture: string };

export const SESSION_COOKIE = 'mpd_session';
export const FLOW_COOKIE = 'mpd_oauth';     // state + PKCE verifier, sống 10 phút
export const DENIED_COOKIE = 'mpd_denied';  // email vừa bị từ chối, để trang login nêu rõ
export const ERROR_COOKIE = 'mpd_error';    // câu lỗi của lần đăng nhập vừa hỏng
export const CALLBACK_PATH = '/api/auth/callback/google';

const SESSION_DAYS = 7;
const AUTH_ENV = ['AUTH_GOOGLE_ID', 'AUTH_GOOGLE_SECRET', 'AUTH_SECRET', 'ALLOWED_EMAILS'] as const;

export function missingAuthEnv(): string[] {
  return AUTH_ENV.filter((n) => !process.env[n]?.trim());
}

export function allowedEmails(): Set<string> {
  return new Set(
    (process.env.ALLOWED_EMAILS ?? '')
      .split(/[,;\s]+/)
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAllowed(email: string): boolean {
  return allowedEmails().has(email.trim().toLowerCase());
}

/* ── Cookie phiên: base64url(JSON) + "." + HMAC-SHA256 ─────────────────── */
const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');

function sign(data: string): string {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) throw new Error('Thiếu AUTH_SECRET trong app/.env.local');
  return createHmac('sha256', secret).update(data).digest('base64url');
}

function seal(payload: object): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function unseal<T>(token: string | undefined): T | null {
  if (!token || !process.env.AUTH_SECRET?.trim()) return null;
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const want = Buffer.from(sign(body));
  const got = Buffer.from(mac);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    return JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function createSession(user: SessionUser): { value: string; maxAge: number } {
  const maxAge = SESSION_DAYS * 86_400;
  return { value: seal({ ...user, exp: Math.floor(Date.now() / 1000) + maxAge }), maxAge };
}

/** Phiên hợp lệ khi: chữ ký đúng, chưa hết hạn, và email VẪN còn trong ALLOWED_EMAILS
    (gỡ email khỏi danh sách là người đó mất quyền ngay ở lần tải trang sau). */
export function readSession(token: string | undefined): SessionUser | null {
  const s = unseal<SessionUser & { exp: number }>(token);
  if (!s || s.exp * 1000 < Date.now() || !isAllowed(s.email)) return null;
  return { email: s.email, name: s.name, picture: s.picture };
}

/* ── Luồng OAuth ───────────────────────────────────────────────────────── */
type Flow = { state: string; verifier: string; next: string; exp: number };

export function startFlow(origin: string, next: string): { url: string; cookie: string } {
  const state = b64(randomBytes(24));
  const verifier = b64(randomBytes(48));
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const q = new URLSearchParams({
    client_id: process.env.AUTH_GOOGLE_ID!.trim(),
    redirect_uri: origin + CALLBACK_PATH,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });
  return {
    url: `https://accounts.google.com/o/oauth2/v2/auth?${q}`,
    cookie: seal({ state, verifier, next, exp: Date.now() + 10 * 60_000 } satisfies Flow),
  };
}

export class AuthError extends Error {}

/** Đổi code lấy id_token rồi đọc thông tin người dùng.
    id_token nhận TRỰC TIẾP từ token endpoint của Google qua TLS nên đọc claim được,
    vẫn kiểm tra iss / aud / exp / email_verified theo OpenID Connect Core §3.1.3.7. */
export async function finishFlow(origin: string, params: URLSearchParams, flowCookie: string | undefined): Promise<{ user: SessionUser; next: string }> {
  const flow = unseal<Flow>(flowCookie);
  if (!flow || flow.exp < Date.now()) throw new AuthError('Phiên đăng nhập đã hết hạn, vui lòng thử lại.');
  if (params.get('error')) throw new AuthError(params.get('error') === 'access_denied' ? 'Bạn đã huỷ đăng nhập Google.' : `Google trả về lỗi: ${params.get('error')}`);
  if (!params.get('state') || params.get('state') !== flow.state) throw new AuthError('Yêu cầu đăng nhập không hợp lệ, vui lòng thử lại.');
  const code = params.get('code');
  if (!code) throw new AuthError('Google không trả về mã đăng nhập.');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.AUTH_GOOGLE_ID!.trim(),
      client_secret: process.env.AUTH_GOOGLE_SECRET!.trim(),
      redirect_uri: origin + CALLBACK_PATH,
      grant_type: 'authorization_code',
      code_verifier: flow.verifier,
    }),
    cache: 'no-store',
  });
  const tok = (await res.json().catch(() => ({}))) as { id_token?: string; error?: string; error_description?: string };
  if (!res.ok || !tok.id_token) {
    console.error('[auth] token exchange failed:', tok.error, tok.error_description);
    throw new AuthError(tok.error === 'redirect_uri_mismatch'
      ? `Redirect URI chưa được khai trong Google Cloud Console: ${origin + CALLBACK_PATH}`
      : 'Không xác thực được với Google, vui lòng thử lại.');
  }

  const claims = JSON.parse(Buffer.from(tok.id_token.split('.')[1] ?? '', 'base64url').toString('utf8')) as {
    iss?: string; aud?: string; exp?: number; email?: string; email_verified?: boolean; name?: string; picture?: string;
  };
  const issOk = claims.iss === 'https://accounts.google.com' || claims.iss === 'accounts.google.com';
  if (!issOk || claims.aud !== process.env.AUTH_GOOGLE_ID!.trim() || !claims.exp || claims.exp * 1000 < Date.now()) {
    throw new AuthError('Thông tin đăng nhập từ Google không hợp lệ.');
  }
  if (!claims.email || !claims.email_verified) throw new AuthError('Tài khoản Google chưa xác minh email.');

  return {
    user: { email: claims.email.toLowerCase(), name: claims.name || claims.email, picture: claims.picture ?? '' },
    next: flow.next,
  };
}

/** Chỉ cho quay về đường dẫn nội bộ, chặn open redirect (vd ?next=https://evil.com). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') ? next : '/dashboard';
}

/** Origin thật của request (sau proxy/port động), dùng làm redirect_uri. */
export function originOf(req: Request): string {
  const h = req.headers;
  const host = h.get('x-forwarded-host') ?? h.get('host');
  const proto = h.get('x-forwarded-proto') ?? new URL(req.url).protocol.replace(':', '');
  return host ? `${proto}://${host}` : new URL(req.url).origin;
}
