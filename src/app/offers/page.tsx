import Link from 'next/link';

export default function OffersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Deals</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Seasonal offers</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {[
          ['Weekend Sale', 'Up to 40% off'],
          ['Bundle Deals', 'Buy 2 get 1 free'],
          ['New Launch', 'Fresh products at promo prices'],
        ].map(([title, desc]) => (
          <div key={title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Offer</p>
            <h2 className="mt-3 text-xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/products" className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">Explore offers</Link>
      </div>
    </main>
  );
}
