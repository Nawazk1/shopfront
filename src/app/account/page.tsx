'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Customer, getCustomerSession, logoutCustomer } from '@/lib/customerAuth';

export default function AccountPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getCustomerSession()
      .then(session => { if (active) setCustomer(session); })
      .catch(() => { if (active) router.replace('/login'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  const handleLogout = async () => {
    setError('');
    try {
      await logoutCustomer();
      router.replace('/');
      router.refresh();
    } catch (logoutError) {
      setError(logoutError instanceof Error ? logoutError.message : 'Could not sign out. Please try again.');
    }
  };

  if (loading || !customer) {
    return <main className="grid min-h-[55vh] place-items-center text-sm text-gray-500">Loading account...</main>;
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Account</p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink">Hello, {customer.name}</h1>
          <p className="mt-2 text-gray-600">Your ShopFront account details.</p>
        </div>
        <button type="button" onClick={() => void handleLogout()} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-red-200 hover:text-red-600">
          <Icon name="ArrowRightStartOnRectangleIcon" size={17} /> Sign out
        </button>
      </div>

      {error && <p role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200 bg-white">
        <section className="flex items-center gap-4 p-5 sm:p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon name="UserIcon" size={23} /></div>
          <div className="min-w-0">
            <h2 className="font-semibold text-ink">Personal details</h2>
            <p className="mt-1 truncate text-sm text-gray-600">{customer.name}</p>
            <p className="truncate text-sm text-gray-600">{customer.email}</p>
          </div>
        </section>
        <section className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
          <Link href="/orders" className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-primary">
            <span><span className="block font-semibold text-ink">Your orders</span><span className="mt-1 block text-sm text-gray-500">View your order history</span></span>
            <Icon name="ChevronRightIcon" size={18} className="shrink-0 text-gray-500" />
          </Link>
          <Link href="/wishlist" className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 p-4 transition hover:border-primary">
            <span><span className="block font-semibold text-ink">Your wishlist</span><span className="mt-1 block text-sm text-gray-500">Return to saved items</span></span>
            <Icon name="ChevronRightIcon" size={18} className="shrink-0 text-gray-500" />
          </Link>
        </section>
      </div>
    </main>
  );
}
