'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { verifyCustomerEmail } from '@/lib/customerAuth';

export default function VerifyEmailPage() {
  const [state, setState] = useState<'loading' | 'verified' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your email address...');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token') || '';
    if (!token) {
      setState('error');
      setMessage('This verification link is missing its token. Request a new verification email.');
      return;
    }
    void verifyCustomerEmail(token)
      .then(() => {
        setState('verified');
        setMessage('Your email is verified. Your ShopFront account is ready.');
      })
      .catch(error => {
        setState('error');
        setMessage(error instanceof Error ? error.message : 'Could not verify this email link.');
      });
  }, []);

  return (
    <main className="grid min-h-[65vh] place-items-center bg-canvas px-4 py-12">
      <section className="w-full max-w-lg border-y border-black/10 bg-white px-6 py-9 text-center sm:border sm:px-9">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${state === 'verified' ? 'bg-green-100 text-green-700' : state === 'error' ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>
          <Icon name={state === 'verified' ? 'CheckIcon' : state === 'error' ? 'ExclamationTriangleIcon' : 'EnvelopeIcon'} size={22} />
        </div>
        <h1 className="mt-5 font-serif text-3xl font-bold text-ink">{state === 'verified' ? 'Email verified' : state === 'error' ? 'Link unavailable' : 'Verifying email'}</h1>
        <p role={state === 'error' ? 'alert' : 'status'} className="mt-3 text-sm leading-6 text-gray-600">{message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {state === 'verified' ? (
            <Link href="/account" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">Go to your account</Link>
          ) : state === 'error' ? (
            <Link href="/login" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">Go to sign in</Link>
          ) : null}
          <Link href="/" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700">Back to shop</Link>
        </div>
      </section>
    </main>
  );
}
