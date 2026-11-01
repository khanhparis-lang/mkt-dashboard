/* Lớp bảo vệ thứ hai sau proxy.ts: đọc lại phiên ngay tại trang, không có phiên hợp lệ thì về /login. */
import type { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserProvider } from '@/components/UserContext';
import { SESSION_COOKIE, readSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = readSession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login?next=/dashboard');
  return <UserProvider user={user}>{children}</UserProvider>;
}
