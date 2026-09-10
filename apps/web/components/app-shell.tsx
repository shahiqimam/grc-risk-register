'use client';

import { BarChart3, Database, FileWarning, Lock, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { me } from '@/lib/api/auth';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/risks', label: 'Risk Register', icon: FileWarning },
  { href: '/assets', label: 'Assets', icon: Database },
  { href: '/controls', label: 'Controls', icon: ShieldCheck },
  { href: '/users', label: 'Users', icon: Users }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/login';
  const user = useQuery({
    queryKey: ['me'],
    queryFn: me,
    enabled: !isLogin && typeof window !== 'undefined' && Boolean(window.localStorage.getItem('accessToken')),
    retry: false
  });

  if (isLogin) {
    return <main>{children}</main>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-white px-4 py-5 md:block">
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-accent text-white">
            <Lock size={20} aria-hidden />
          </div>
          <div>
            <p className="text-sm font-semibold">GRC Risk Register</p>
            <p className="text-xs text-muted">Demo organization</p>
          </div>
        </div>
        <nav className="space-y-1">
          {navItems.filter((item) => item.href !== '/users' || user.data?.role === 'ADMIN').map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm ${
                  active ? 'bg-teal-50 text-accent' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon size={17} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="md:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-line bg-white px-6">
          <div>
            <p className="text-sm text-muted">Portfolio application</p>
            <h1 className="text-lg font-semibold">Risk workspace</h1>
          </div>
          <div className="flex items-center gap-3 text-right text-sm">
            <div>
              <p className="font-medium">{user.data?.name ?? 'Signed out'}</p>
              <p className="text-muted">{user.data?.role ?? 'No active session'}</p>
            </div>
            <button
              className="rounded border border-line px-3 py-2 text-xs font-semibold"
              onClick={() => {
                window.localStorage.removeItem('accessToken');
                router.push('/login');
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
