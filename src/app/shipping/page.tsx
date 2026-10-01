import Link from 'next/link';

export default function ShippingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Delivery</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Shipping information</h1>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Delivery time</h2>
          <p className="mt-2 text-gray-600">Most orders arrive within 2-5 working days. Remote locations may take a little longer.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Shipping charges</h2>
          <p className="mt-2 text-gray-600">A ₹79 shipping fee is shown in the cart before checkout. The order summary displays the final amount.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Track an order</h2>
          <p className="mt-2 text-gray-600">Visit your <Link href="/orders" className="font-medium text-primary underline">orders page</Link> for order status.</p>
        </section>
      </div>
    </main>
  );
}
