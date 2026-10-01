'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/site/ProductCard';
import { Product, getProducts } from '@/lib/catalogueStore';
import { getWishlistProducts, toggleWishlist } from '@/lib/shopHelpers';

export default function WishlistPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const storedProducts = await getProducts();
      setProducts(storedProducts);
      setWishlistProducts(getWishlistProducts(storedProducts));
    };

    void loadProducts();
  }, []);

  const handleRemove = (id: string) => {
    toggleWishlist(id);
    setWishlistProducts(getWishlistProducts(products));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Saved items</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Your wishlist</h1>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">No wishlist items yet</h2>
          <p className="mt-2 text-gray-600">Save products you love and revisit them here.</p>
          <Link href="/products" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white">
            Explore products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((product) => (
            <div key={product.id} className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm">
              <ProductCard product={product} />
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-red-200 hover:text-red-500"
              >
                Remove from wishlist
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
