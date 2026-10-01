import Link from 'next/link';

const categories = ['Clothing', 'Electronics', 'Footwear', 'Accessories', 'Home & Kitchen', 'Beauty & Personal Care'];

export default function CategoriesPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Categories</p>
      <h1 className="mt-2 text-4xl font-bold text-gray-900">Browse by category</h1>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category}
            href="/products"
            className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <p className="text-xl font-semibold text-gray-900">{category}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
