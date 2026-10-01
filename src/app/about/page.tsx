import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">About us</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">We make shopping simple</h1>
      <div className="mt-8 space-y-6 text-gray-600">
        <p>ShopFront is built for modern consumers who want quality products, clear pricing, and a seamless shopping experience.</p>
        <p>From electronics to everyday essentials, we focus on trust, style, and customer satisfaction.</p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          ['10k+', 'Happy shoppers'],
          ['24/7', 'Customer support'],
          ['4.8/5', 'Average rating'],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="mt-2 text-sm text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link href="/products" className="rounded-xl bg-primary px-5 py-3 font-semibold text-white">Shop now</Link>
      </div>
    </main>
  );
}
