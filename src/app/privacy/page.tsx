export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Privacy</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Your privacy</h1>
      <div className="mt-8 divide-y divide-gray-200 border-y border-gray-200">
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Information used by this demo</h2>
          <p className="mt-2 text-gray-600">Cart and wishlist selections are stored in this browser. Checkout details are not sent to a payment processor by this demo.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Payment details</h2>
          <p className="mt-2 text-gray-600">Do not enter real card details. The current checkout is a demonstration flow and does not process payments.</p>
        </section>
        <section className="py-6">
          <h2 className="text-xl font-semibold text-gray-900">Questions</h2>
          <p className="mt-2 text-gray-600">For questions about this store, visit the contact page.</p>
        </section>
      </div>
    </main>
  );
}
