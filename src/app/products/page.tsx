'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/site/ProductCard';
import Icon from '@/components/ui/AppIcon';
import { Product, getProducts } from '@/lib/catalogueStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        setProducts(await getProducts());
      } finally {
        setLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const categories = Array.from(new Set(products.map((product) => product.category)));

  const filtered = products.filter((product) => {
    const query = search.toLowerCase();
    const matchesSearch =
      !search ||
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query);
    const matchesCategory = !category || product.category === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Shop all</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">Discover products</h1>
        </div>

        <div className="relative w-full max-w-md">
          <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, brand or category"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm text-gray-700 outline-none transition focus:border-primary"
          />
        </div>
      </div>

      {categories.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              !category ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-600'
            }`}
          >
            All
          </button>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item === category ? '' : item)}
              className={`rounded-full px-4 py-2 text-sm font-medium ${
                category === item ? 'bg-primary text-white' : 'border border-gray-200 bg-white text-gray-600'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="h-72 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
