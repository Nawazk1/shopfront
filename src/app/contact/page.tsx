export default function ContactPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Contact</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">We’re here to help</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Customer support</h2>
          <p className="mt-3 text-gray-600">support@shopfront.example</p>
          <p className="mt-2 text-gray-600">+91 98765 43210</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Business inquiries</h2>
          <p className="mt-3 text-gray-600">sales@shopfront.example</p>
          <p className="mt-2 text-gray-600">Mon-Sat • 9AM to 8PM</p>
        </div>
      </div>
    </main>
  );
}
