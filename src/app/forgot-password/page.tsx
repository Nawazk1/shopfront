'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { requestPasswordReset } from '@/lib/customerAuth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [developmentResetUrl, setDevelopmentResetUrl] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
      setDevelopmentResetUrl(result.developmentResetUrl || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not request a password reset.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-[65vh] place-items-center bg-canvas px-4 py-12">
      <section className="w-full max-w-md border-y border-black/10 bg-white px-6 py-9 sm:border sm:px-9">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary"><Icon name="ArrowLeftIcon" size={16} /> Back to sign in</Link>
        <h1 className="mt-8 font-serif text-3xl font-bold text-ink">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">Enter the email used for your account. We’ll send a reset link if a verified account matches.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label htmlFor="reset-email" className="block text-sm font-semibold text-ink">Email address</label>
          <input id="reset-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" placeholder="you@example.com" />
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          {message && <p role="status" className="rounded-lg border border-green-200 bg-green-50 px-3.5 py-3 text-sm text-green-800">{message}</p>}
          {developmentResetUrl && <Link href={developmentResetUrl} className="inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">Reset password (local development)</Link>}
          <button type="submit" disabled={submitting} className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60">{submitting ? 'Sending...' : 'Send reset link'}</button>
        </form>
      </section>
    </main>
  );
}
