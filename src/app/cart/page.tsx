'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { Product, getProducts } from '@/lib/catalogueStore';
import { getCartProducts, removeFromCart, updateCartQuantity } from '@/lib/shopHelpers';

export default function CartPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<Array<Product & { quantity: number }>>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const items = await getProducts();
      setProducts(items);
      setCartItems(getCartProducts(items));
    };

    void fetchProducts();
  }, []);

  const subtotal = cartItems.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const shipping = cartItems.length > 0 ? 79 : 0;
  const total = subtotal + shipping;

  const updateItemQuantity = (productId: string, quantity: number) => {
    updateCartQuantity(productId, quantity);
    setCartItems(getCartProducts(products));
  };

  const removeItem = (productId: string) => {
    removeFromCart(productId);
    setCartItems(getCartProducts(products));
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Your cart</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Shopping cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Your cart is empty</h2>
          <p className="mt-2 text-gray-600">Add some products to continue shopping.</p>
          <Link href="/products" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-3 font-semibold text-white">
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <img src={item.images[0]?.url || ''} alt={item.name} className="h-28 w-28 rounded-xl object-cover" />

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">{item.category}</p>
                      <h2 className="mt-1 text-lg font-semibold text-gray-900">{item.name}</h2>
                    </div>
                    <button type="button" onClick={() => removeItem(item.id)} className="text-sm text-gray-500 hover:text-red-500">
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-2 py-1">
                      <button type="button" onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="p-1 text-gray-600">
                        <Icon name="MinusIcon" size={14} />
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                      <button type="button" onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="p-1 text-gray-600">
                        <Icon name="PlusIcon" size={14} />
                      </button>
                    </div>

                    <p className="text-lg font-bold text-gray-900">₹{(item.sellingPrice * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
            <div className="mt-5 space-y-3 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>₹{shipping.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount</span>
                <span>₹0</span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
            </div>

            <Link href="/checkout" className="mt-6 inline-flex w-full justify-center rounded-xl bg-primary px-4 py-3 text-center font-semibold text-white hover:bg-primary-dark">
              Proceed to Checkout
            </Link>
          </aside>
        </div>
      )}
    </main>
  );
}
