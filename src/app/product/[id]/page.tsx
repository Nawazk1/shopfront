'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProductCard from '@/components/site/ProductCard';
import { Product, getProductById, getProducts } from '@/lib/catalogueStore';
import { addToCart, getWishlistIds, toggleWishlist } from '@/lib/shopHelpers';

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      setLoading(true);
      const id = String(params?.id ?? '');
      const loadedProduct = await getProductById(id);
      const allProducts = await getProducts();
      setProduct(loadedProduct || null);
      setProducts(allProducts);
      setLiked(getWishlistIds().includes(id));
      setLoading(false);
    };

    void loadProduct();
  }, [params]);

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-gray-500">Loading product...</div>;
  }

  if (!product) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Product not found</h1>
        <Link href="/products" className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-white">
          Back to products
        </Link>
      </main>
    );
  }

  const related = products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 4);
  const mainImage = product.images.find((img) => img.isMain) || product.images[0];

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    setLiked((prev) => !prev);
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/products" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary">
        <Icon name="ArrowLeftIcon" size={16} />
        Back to products
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <img src={mainImage?.url || ''} alt={product.name} className="h-[520px] w-full rounded-xl object-cover" />
          <div className="mt-4 grid grid-cols-4 gap-3">
            {product.images.slice(0, 4).map((image) => (
              <img key={image.id} src={image.url} alt={image.alt} className="h-24 w-full rounded-lg object-cover" />
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">{product.category}</p>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-2 text-sm text-gray-500">{product.brand}</p>

          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-gray-900">₹{product.sellingPrice.toLocaleString()}</span>
            {product.mrp > product.sellingPrice && (
              <span className="text-lg text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
            )}
            {product.discount > 0 && (
              <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-600">-{product.discount}%</span>
            )}
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => addToCart(product.id)}
              className="flex-1 rounded-xl bg-primary px-5 py-3 font-semibold text-white hover:bg-primary-dark"
            >
              Add to Cart
            </button>
            <button
              type="button"
              onClick={handleWishlistToggle}
              className="flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 hover:text-red-500"
            >
              <Icon name="HeartIcon" size={18} className={liked ? 'fill-red-500 text-red-500' : ''} />
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <p>{product.shortDescription}</p>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-500">
              <span>SKU: {product.sku}</span>
              <span>Stock: {product.stockStatus.replace('_', ' ')}</span>
              <span>Color: {product.color}</span>
              <span>Size: {product.size}</span>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900">Description</h2>
            <p className="mt-3 text-sm leading-7 text-gray-600">{product.fullDescription}</p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Related products</h2>
            <Link href="/products" className="text-sm font-medium text-primary hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
