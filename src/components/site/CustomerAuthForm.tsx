'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { loginCustomer, registerCustomer, resendCustomerVerification } from '@/lib/customerAuth';

interface CustomerAuthFormProps {
  mode: 'login' | 'register';
}

export default function CustomerAuthForm({ mode }: CustomerAuthFormProps) {
  const router = useRouter();
  const isRegister = mode === 'register';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [developmentVerificationUrl, setDevelopmentVerificationUrl] = useState('');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        const result = await registerCustomer(name, email, password);
        setRegistrationMessage(result.message);
        setDevelopmentVerificationUrl(result.developmentVerificationUrl || '');
        setVerificationEmail(email);
        setSubmitting(false);
        return;
      }
      await loginCustomer(email, password);
      const requestedPath = new URLSearchParams(window.location.search).get('next');
      const nextPath = requestedPath?.startsWith('/') && !requestedPath.startsWith('//') ? requestedPath : '/account';
      router.replace(nextPath);
      router.refresh();
    } catch (authError) {
      const message = authError instanceof Error ? authError.message : 'Could not complete sign-in. Please try again.';
      setError(message);
      if (message.includes('verify your email')) setVerificationEmail(email);
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendMessage('');
    try {
      const result = await resendCustomerVerification(verificationEmail);
      setResendMessage(result.developmentVerificationUrl
        ? 'Development verification link is ready below.'
        : result.message);
      if (result.developmentVerificationUrl) setDevelopmentVerificationUrl(result.developmentVerificationUrl);
    } catch (resendError) {
      setResendMessage(resendError instanceof Error ? resendError.message : 'Could not resend the verification link.');
    }
  };

  if (registrationMessage) {
    return (
      <main className="grid min-h-[72vh] place-items-center bg-canvas px-4 py-12">
        <section className="w-full max-w-md border-y border-black/10 bg-white px-6 py-9 sm:border sm:px-9">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white"><Icon name="EnvelopeIcon" size={22} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-accent">One last step</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-ink">Check your email</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">{registrationMessage} {developmentVerificationUrl ? 'Use the local verification link below to activate' : 'Check the inbox for'} {verificationEmail}.</p>
          {developmentVerificationUrl && <Link href={developmentVerificationUrl} className="mt-5 inline-flex rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white">Verify email (local development)</Link>}
          <p className="mt-6 text-sm text-gray-600">Already verified? <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link></p>
        </section>
      </main>
    );
  }

  return (
    <main className="grid min-h-[72vh] place-items-center bg-canvas px-4 py-12">
      <section className="w-full max-w-md border-y border-black/10 bg-white px-6 py-9 sm:border sm:px-9">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
          <Icon name="ArrowLeftIcon" size={16} /> Back to ShopFront
        </Link>
        <div className="mt-8 flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-white">
          <Icon name="UserCircleIcon" size={22} />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-accent">Your ShopFront account</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">
          {isRegister ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          {isRegister ? 'Sign up to keep your details and shopping together.' : 'Sign in to continue to your ShopFront account.'}
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          {isRegister && (
            <div>
              <label htmlFor="customer-name" className="mb-1.5 block text-sm font-semibold text-ink">Full name</label>
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                minLength={2}
                maxLength={80}
                required
                value={name}
                onChange={event => setName(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                placeholder="Your name"
              />
            </div>
          )}
          <div>
            <label htmlFor="customer-email" className="mb-1.5 block text-sm font-semibold text-ink">Email address</label>
            <input
              id="customer-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={event => setEmail(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="customer-password" className="mb-1.5 block text-sm font-semibold text-ink">Password</label>
            <input
              id="customer-password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              minLength={isRegister ? 8 : undefined}
              maxLength={128}
              required
              value={password}
              onChange={event => setPassword(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3.5 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              placeholder={isRegister ? 'At least 8 characters' : 'Your password'}
            />
          </div>
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}
          {!isRegister && verificationEmail && (
            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900">
              <p>Your email needs verification before you can sign in.</p>
              <button type="button" onClick={() => void handleResendVerification()} className="font-semibold underline">Resend verification link</button>
              {resendMessage && <p role="status">{resendMessage}</p>}
              {developmentVerificationUrl && <Link href={developmentVerificationUrl} className="block font-semibold underline">Verify email (local development)</Link>}
            </div>
          )}
          <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-wait disabled:opacity-60">
            {submitting ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}
            {!submitting && <Icon name="ArrowRightIcon" size={16} />}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {isRegister ? 'Already have an account?' : 'New to ShopFront?'}{' '}
          <Link href={isRegister ? '/login' : '/register'} className="font-semibold text-primary hover:underline">
            {isRegister ? 'Sign in' : 'Create an account'}
          </Link>
        </p>
        {!isRegister && <p className="mt-3 text-center text-sm"><Link href="/forgot-password" className="font-medium text-primary hover:underline">Forgot password?</Link></p>}
      </section>
    </main>
  );
}