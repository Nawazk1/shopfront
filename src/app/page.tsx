'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import ProductCard from '@/components/site/ProductCard';
import { Product, getPublishedProducts } from '@/lib/catalogueStore';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setLoadError(false);
      try {
        setProducts(await getPublishedProducts());
      } catch {
        setLoadError(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadProducts();
  }, []);

  const categories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchCat = !category || p.category === category;
    return matchSearch && matchCat;
  });
  const featuredProduct = products[0];
  const featuredImage = featuredProduct?.images.find(image => image.isMain) || featuredProduct?.images[0];

  return (
    <main className="min-h-screen bg-canvas">
      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:px-6 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:pb-14 md:pt-12 lg:px-8">
        <div className="order-2 max-w-xl md:order-1">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
            <span className="h-2 w-2 rounded-full bg-accent" /> The everyday edit
          </p>
          <h1 className="max-w-lg font-serif text-4xl font-bold leading-[1.05] text-ink sm:text-5xl lg:text-6xl">
            Good finds.<br />Better everyday.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-gray-600 sm:text-lg">
            Thoughtful picks for your wardrobe, home and everything in between.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-dark">
              Shop the collection <Icon name="ArrowRightIcon" size={16} />
            </Link>
            <Link href="/offers" className="inline-flex items-center rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-ink transition hover:border-primary hover:text-primary">
              See offers
            </Link>
          </div>
          <form onSubmit={event => { event.preventDefault(); document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' }); }} className="mt-8 flex max-w-md items-center gap-3 border-b border-gray-300 pb-3">
            <Icon name="MagnifyingGlassIcon" size={19} className="shrink-0 text-gray-500" />
            <input
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="What are you looking for?"
              aria-label="Search products"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-gray-500"
            />
            <button type="submit" className="text-sm font-semibold text-primary hover:text-primary-dark">Search</button>
          </form>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-gray-600">
            <span className="inline-flex items-center gap-2"><Icon name="TruckIcon" size={16} className="text-primary" /> 2-4 day delivery</span>
            <span className="inline-flex items-center gap-2"><Icon name="ArrowPathIcon" size={16} className="text-primary" /> Easy 7-day returns</span>
          </div>
        </div>

        <div className="relative order-1 min-h-[260px] overflow-hidden rounded-lg bg-[#e5e8dc] md:order-2 md:min-h-[440px]">
          <img
            src={featuredImage?.url || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=85'}
            alt={featuredProduct?.name || 'ShopFront seasonal collection'}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-4 p-5 text-white sm:p-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">Picked for you</p>
              <p className="mt-1 text-lg font-semibold sm:text-xl">{featuredProduct?.name || 'New season, new favourites'}</p>
              {featuredProduct && <p className="mt-1 text-sm text-white/85">From ₹{featuredProduct.sellingPrice.toLocaleString()}</p>}
            </div>
            {featuredProduct && <Link href={`/product/${featuredProduct.id}`} aria-label={`View ${featuredProduct.name}`} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-primary transition hover:bg-primary hover:text-white"><Icon name="ArrowUpRightIcon" size={20} /></Link>}
          </div>
          <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-ink">The new edit</span>
        </div>
      </section>

      <section id="collection" className="border-y border-black/10 bg-white/70">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Find your thing</p>
              <h2 className="mt-2 font-serif text-2xl font-bold text-ink sm:text-3xl">Shop by category</h2>
            </div>
            <Link href="/categories" className="shrink-0 text-sm font-semibold text-primary hover:underline">All categories <span aria-hidden="true">→</span></Link>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button type="button" onClick={() => setCategory('')} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${!category ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'}`}>Everything</button>
            {categories.map(cat => (
              <button key={cat} type="button" onClick={() => setCategory(cat === category ? '' : cat)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${category === cat ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white text-gray-700 hover:border-primary hover:text-primary'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">A little inspiration</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-ink sm:text-3xl">Popular right now</h2>
            {!isLoading && !loadError && <p className="mt-1 text-sm text-gray-500">{filtered.length} things worth a look</p>}
          </div>
          <Link href="/products" className="shrink-0 text-sm font-semibold text-primary hover:underline">View all <span aria-hidden="true">→</span></Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-lg bg-gray-200" />)}
          </div>
        ) : loadError || filtered.length === 0 ? (
          <div className="border-y border-gray-200 py-12 text-center">
            <Icon name={loadError ? 'ExclamationCircleIcon' : 'ShoppingBagIcon'} size={28} className="mx-auto text-gray-400" />
            <h3 className="mt-3 text-lg font-semibold text-ink">{loadError ? 'We could not load the collection' : search || category ? 'No matching products' : 'The collection is being refreshed'}</h3>
            <p className="mt-1 text-sm text-gray-500">{loadError ? 'Please check back in a moment.' : 'Try another search or explore all products.'}</p>
            <Link href="/products" className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline">Browse all products</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {filtered.slice(0, 8).map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </section>
    </main>
  );
}
