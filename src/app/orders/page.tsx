'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { CustomerOrder, getCustomerOrders } from '@/lib/customerAuth';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void getCustomerOrders()
      .then(customerOrders => { if (active) setOrders(customerOrders); })
      .catch(() => {
        if (!active) return;
        setError('Sign in to see orders placed with your account.');
        router.replace('/login?next=/orders');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [router]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Your ShopFront account</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-ink">Your orders</h1>

      {loading ? (
        <p className="mt-8 text-sm text-gray-500">Loading your orders...</p>
      ) : error ? (
        <div className="mt-8 border-y border-gray-200 py-8">
          <p className="text-gray-600">{error}</p>
          <Link href="/login?next=/orders" className="mt-4 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Sign in</Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-8 border-y border-gray-200 py-10">
          <h2 className="text-xl font-semibold text-ink">No orders yet</h2>
          <p className="mt-2 text-sm text-gray-600">Orders placed while signed in will appear here.</p>
          <Link href="/products" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white">Browse products</Link>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
          {orders.map(order => (
            <article key={order.id} className="py-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">{order.orderNumber}</h2>
                  <p className="mt-1 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-ink">₹{order.total.toLocaleString()}</p>
                  <p className="mt-1 text-xs font-medium text-green-700">Cash on delivery · {order.status}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                {order.items.map(item => <p key={`${order.id}-${item.productId}`}>{item.name} × {item.quantity} <span className="text-gray-400">· ₹{item.lineTotal.toLocaleString()}</span></p>)}
              </div>
              <p className="mt-4 inline-flex items-start gap-2 text-sm text-gray-500"><Icon name="MapPinIcon" size={16} className="mt-0.5 shrink-0" />{order.shippingAddress.address}, {order.shippingAddress.city} {order.shippingAddress.postalCode}</p>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
