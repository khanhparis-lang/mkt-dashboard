'use client';
/* Người đang đăng nhập (tên, email, ảnh Google) — app/dashboard/layout.tsx đọc phiên ở server rồi đưa xuống đây. */
import { createContext, useContext, type ReactNode } from 'react';
import type { SessionUser } from '@/lib/auth';

const Ctx = createContext<SessionUser | null>(null);

export function UserProvider({ user, children }: { user: SessionUser | null; children: ReactNode }) {
  return <Ctx.Provider value={user}>{children}</Ctx.Provider>;
}

export function useUser(): SessionUser | null {
  return useContext(Ctx);
}

/** Tên gọi trong lời chào: chữ cuối của tên tiếng Việt ("Lê Thị Khánh" → "Khánh"). */
export function firstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts[parts.length - 1] || name;
}
