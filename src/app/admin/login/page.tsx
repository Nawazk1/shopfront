'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { getAdminSession, loginAdmin } from '@/lib/catalogueStore';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    void getAdminSession()
      .then(() => { if (active) router.replace('/admin/products'); })
      .catch((sessionError: unknown) => {
        if (!active || !(sessionError instanceof Error)) return;
        if (sessionError.message.includes('not configured')) {
          setError('Admin access is not configured yet. Add ADMIN_EMAIL, ADMIN_PASSWORD, and ADMIN_JWT_SECRET to backend/.env, then restart the backend.');
        } else if (sessionError.message === 'Failed to fetch') {
          setError('The backend is not reachable. Start the API server, then try again.');
        }
      });
    return () => { active = false; };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await loginAdmin(email, password);
      router.replace('/admin/products');
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Could not sign in. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[75vh] place-items-center bg-canvas px-4 py-12">
      <section className="w-full max-w-md border-y border-black/10 bg-white px-6 py-9 sm:border sm:px-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
          <Icon name="ArrowLeftIcon" size={16} /> Back to ShopFront
        </Link>
        <div className="mt-8 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
          <Icon name="LockClosedIcon" size={21} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-accent">ShopFront control room</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">Admin sign in</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">Sign in with the store owner account to manage product listings.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-ink">Admin email</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="Enter your admin password"
            />
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
            {isSubmitting ? 'Signing in...' : 'Sign in to admin'}
            {!isSubmitting && <Icon name="ArrowRightIcon" size={16} />}
          </button>
        </form>
      </section>
    </main>
  );
}
