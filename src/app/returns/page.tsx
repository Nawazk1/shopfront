import Link from 'next/link';

export default function ReturnsPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Returns</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Returns and refunds</h1>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Return window</h2>
          <p className="mt-2 text-gray-600">Eligible items can be returned within 7 days after delivery. Items should be unused and include their original packaging.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Request a return</h2>
          <p className="mt-2 text-gray-600">Contact <Link href="/contact" className="font-medium text-primary underline">customer support</Link> with your order number and the reason for return.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Refund timing</h2>
          <p className="mt-2 text-gray-600">Approved refunds are sent to the original payment method. Processing time depends on your payment provider.</p>
        </section>
      </div>
    </main>
  );
}
