export default function SearchPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Search</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Search products</h1>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <input placeholder="Try “shirts”, “shoes”, or “electronics”" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
        <button className="mt-4 rounded-xl bg-primary px-5 py-3 font-semibold text-white">Search</button>
      </div>
    </main>
  );
}
