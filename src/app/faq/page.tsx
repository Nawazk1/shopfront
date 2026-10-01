export default function FaqPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">FAQ</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Frequently asked questions</h1>

      <div className="mt-8 space-y-4">
        {[
          ['How long does delivery take?', 'Most orders are delivered in 2-5 working days depending on your location.'],
          ['Can I return a product?', 'Yes, we offer easy returns within 7 days of delivery for eligible items.'],
          ['Do you offer secure payment?', 'Yes, all transactions are securely processed through our payment flow.'],
          ['Can I save items to wishlist?', 'Yes, you can save products to wishlist and revisit them anytime.'],
        ].map(([question, answer]) => (
          <div key={question} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">{question}</h2>
            <p className="mt-2 text-gray-600">{answer}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
