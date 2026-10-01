'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { resetCustomerPassword } from '@/lib/customerAuth';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '');
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!token) return setError('This reset link is missing its token. Request another one.');
    if (password !== confirmPassword) return setError('The passwords do not match.');
    setSubmitting(true);
    try {
      await resetCustomerPassword(token, password);
      router.replace('/account');
      router.refresh();
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : 'Could not reset your password.');
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[65vh] place-items-center bg-canvas px-4 py-12">
      <section className="w-full max-w-md border-y border-black/10 bg-white px-6 py-9 sm:border sm:px-9">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"><Icon name="ArrowLeftIcon" size={16} /> Back to sign in</Link>
        <h1 className="mt-8 font-serif text-3xl font-bold text-ink">Choose a new password</h1>
        <p className="mt-2 text-sm text-gray-600">Use at least 8 characters. This reset link expires after one hour.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div><label htmlFor="new-password" className="mb-1.5 block text-sm font-semibold text-ink">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
          <div><label htmlFor="confirm-password" className="mb-1.5 block text-sm font-semibold text-ink">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={8} maxLength={128} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={submitting || !token} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{submitting ? 'Saving...' : 'Save new password'}</button>
        </form>
      </section>
    </main>
  );
}
