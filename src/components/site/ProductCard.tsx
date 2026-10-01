'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Product } from '@/lib/catalogueStore';
import { addToCart, getWishlistIds, toggleWishlist } from '@/lib/shopHelpers';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    setLiked(getWishlistIds().includes(product.id));
  }, [product.id]);

  const mainImage = product.images.find((img) => img.isMain) || product.images[0];

  const handleAddToCart = () => {
    addToCart(product.id, 1);
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product.id);
    setLiked((prev) => !prev);
  };

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-[#e9e9e2]">
        <Link href={`/product/${product.id}`}>
          {mainImage ? (
            <img src={mainImage.url} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <Icon name="PhotoIcon" size={32} />
            </div>
          )}
        </Link>

        {product.discount > 0 && (
          <span className="absolute left-2 top-2 rounded bg-accent px-2 py-1 text-[10px] font-bold text-white">
            -{product.discount}%
          </span>
        )}

        <button
          type="button"
          onClick={handleWishlistToggle}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-sm transition hover:text-accent"
          aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Icon name="HeartIcon" size={16} className={liked ? 'fill-red-500 text-red-500' : ''} />
        </button>
      </div>

      <div className="pt-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{product.category}</p>
        <Link href={`/product/${product.id}`} className="mt-1 block">
          <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-ink transition group-hover:text-primary">{product.name}</h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-ink">₹{product.sellingPrice.toLocaleString()}</span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-gray-400 line-through">₹{product.mrp.toLocaleString()}</span>
          )}
        </div>

        {product.stockStatus === 'low_stock' && (
          <p className="mt-1 text-xs text-orange-500">Only {product.stockQuantity} left</p>
        )}

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.stockStatus === 'out_of_stock'}
          className="mt-3 w-full rounded-lg border border-primary px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {product.stockStatus === 'out_of_stock' ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </article>
  );
}
