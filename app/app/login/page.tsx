/* Trang đăng nhập. Cùng hộp 1600×900 (#login) và cùng token với dashboard.
   Một hành động duy nhất: nút Google. Các trạng thái: bình thường · không có quyền · lỗi · chưa cấu hình · vừa đăng xuất. */
import { cookies } from 'next/headers';
import { Icon } from '@/components/Icon';
import { Shell } from '@/components/Shell';
import { DENIED_COOKIE, ERROR_COOKIE, missingAuthEnv, safeNext } from '@/lib/auth';
import { CFG } from '@/lib/config';

export const dynamic = 'force-dynamic';

/* Logo "G" 4 màu bản chính thức — theo quy định nhận diện của Google cho nút tự dựng. */
function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : sp[k]) as string | undefined;
  const error = one('error');
  const next = safeNext(one('next'));
  const jar = await cookies();
  const deniedEmail = error === 'denied' ? jar.get(DENIED_COOKIE)?.value : undefined;
  const failedMsg = error === 'failed' ? decodeURIComponent(jar.get(ERROR_COOKIE)?.value ?? '') : '';
  const missing = missingAuthEnv();

  const href = `/api/auth/login?next=${encodeURIComponent(next)}`;

  return (
    <Shell id="login">
      <div className="logincard">
        <div className="loginbrand"><div className="lmark"><Icon name="activity" /></div><b>{CFG.app.name}</b></div>
        <h1>Đăng nhập để xem dashboard</h1>
        <p className="lead">Dùng tài khoản Google công việc của bạn. Chỉ những email đã được Admin cấp quyền mới vào được.</p>

        {missing.length ? (
          <div className="err" role="alert">
            <b>Chưa cấu hình đăng nhập Google</b>
            Admin cần điền {missing.map((m, i) => <span key={m}>{i ? ', ' : ''}<code>{m}</code></span>)} trong <code>app/.env.local</code> rồi chạy lại app.
          </div>
        ) : (
          <a id="gbtn" href={href}>
            <GoogleG />Đăng nhập bằng Google
          </a>
        )}

        {error === 'denied' && (
          <div className="err" role="alert">
            <b>Bạn không có quyền truy cập vui lòng liên hệ Admin</b>
            {deniedEmail
              ? <>Tài khoản <code>{deniedEmail}</code> chưa có trong danh sách được phép.</>
              : <>Tài khoản vừa dùng chưa có trong danh sách được phép.</>}
            {' '}Bấm nút Google ở trên để chọn tài khoản khác.
          </div>
        )}
        {error === 'failed' && (
          <div className="err" role="alert">
            <b>Đăng nhập không thành công</b>
            {failedMsg || 'Vui lòng thử lại.'}
          </div>
        )}
        {error === 'config' && !missing.length && (
          <div className="err" role="alert"><b>Chưa cấu hình đăng nhập Google</b>Vui lòng liên hệ Admin.</div>
        )}

        {one('loggedout') && !error ? (
          <div className="note"><i><Icon name="circle-check" className="lu-sm" /></i><span>Bạn đã đăng xuất. Đăng nhập lại bất cứ lúc nào.</span></div>
        ) : (
          <div className="note">
            <i><Icon name="users" className="lu-sm" /></i>
            <span>Lần đầu dùng? Gửi email Google của bạn cho Admin để được thêm vào danh sách truy cập.</span>
          </div>
        )}
        <div className="legal">Ứng dụng chỉ đọc tên, email và ảnh đại diện Google của bạn để xác nhận quyền truy cập.</div>
      </div>
    </Shell>
  );
}
