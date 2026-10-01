import Link from 'next/link';

export default function PaymentSuccessPage({ searchParams }: { searchParams: { method?: string; order?: string } }) {
  const isCashOnDelivery = searchParams.method === 'cod';

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-green-200 bg-green-50 p-10 shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-2xl text-white">✓</div>
        <h1 className="mt-6 text-4xl font-bold text-gray-900">{isCashOnDelivery ? 'Order placed!' : 'Payment successful!'}</h1>
        <p className="mt-3 text-lg text-gray-600">
          {isCashOnDelivery
            ? 'Your order is confirmed. Pay the delivery partner when it arrives.'
            : 'Your order has been placed and is being prepared for delivery.'}
        </p>
        {searchParams.order && <p className="mt-4 text-sm font-semibold text-gray-700">Order number: {searchParams.order}</p>}

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link href="/products" className="rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark">
            Continue shopping
          </Link>
          <Link href="/orders" className="rounded-xl border border-gray-200 bg-white px-5 py-3 font-semibold text-gray-700 hover:border-primary hover:text-primary">
            View orders
          </Link>
        </div>
      </div>
    </main>
  );
}
