'use client';

import { Lock } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.test');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const result = await login(email, password);
      window.localStorage.setItem('accessToken', result.accessToken);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded border border-line bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-accent text-white">
            <Lock size={20} aria-hidden />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Sign in</h1>
            <p className="text-sm text-muted">GRC Risk Register</p>
          </div>
        </div>
        <label className="mb-4 block text-sm font-medium">
          Email
          <input className="mt-1 w-full rounded border border-line px-3 py-2" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Password
          <input
            className="mt-1 w-full rounded border border-line px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error ? <p className="mb-4 text-sm text-danger">{error}</p> : null}
        <button className="w-full rounded bg-accent px-4 py-2 text-sm font-semibold text-white" type="submit">
          Log in
        </button>
      </form>
    </div>
  );
}
