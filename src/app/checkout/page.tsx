'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Product, getProducts } from '@/lib/catalogueStore';
import { clearCart, getCartProducts } from '@/lib/shopHelpers';
import { createCustomerOrder, Customer, getCustomerSession } from '@/lib/customerAuth';

export default function CheckoutPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<Array<Product & { quantity: number }>>([]);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('cod');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [checkingCustomer, setCheckingCustomer] = useState(true);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    const loadItems = async () => {
      const allProducts = await getProducts();
      setProducts(allProducts);
      setItems(getCartProducts(allProducts));
    };

    void loadItems();
    void getCustomerSession()
      .then(setCustomer)
      .catch(() => setCustomer(null))
      .finally(() => setCheckingCustomer(false));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0);
  const shipping = items.length > 0 ? 79 : 0;
  const total = subtotal + shipping;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!customer) {
      router.push('/login?next=/checkout');
      return;
    }
    if (paymentMethod !== 'cod') return;
    setSubmitting(true);
    setCheckoutError('');
    const formData = new FormData(event.currentTarget);
    try {
      const order = await createCustomerOrder({
        items: items.map(item => ({ productId: item.id, quantity: item.quantity })),
        shippingAddress: {
          address: String(formData.get('address') || ''),
          city: String(formData.get('city') || ''),
          postalCode: String(formData.get('postalCode') || ''),
        },
        paymentMethod: 'cod',
      });
      clearCart();
      router.push(`/payment-success?method=cod&order=${encodeURIComponent(order.orderNumber)}`);
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Could not place the order. Please try again.');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-3 text-gray-600">Add products before checking out.</p>
        <Link href="/products" className="mt-6 inline-block rounded-lg bg-primary px-5 py-3 font-semibold text-white">
          Go to products
        </Link>
      </main>
    );
  }

  if (checkingCustomer) {
    return <main className="grid min-h-[55vh] place-items-center text-sm text-gray-500">Checking your account...</main>;
  }

  if (!customer) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-medium uppercase tracking-[0.16em] text-primary">Checkout</p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-ink">Sign in to place your order</h1>
        <p className="mt-3 text-gray-600">Your orders are saved to your ShopFront account so you can find them later.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/login?next=/checkout" className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white">Sign in</Link>
          <Link href="/register?next=/checkout" className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700">Create account</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Checkout</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">Payment details</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Shipping information</h2>
            <p className="mt-2 text-sm text-gray-500">Order for {customer.name} · {customer.email}</p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <input name="address" required minLength={5} maxLength={300} className="md:col-span-2 rounded-xl border border-gray-200 px-4 py-3 text-sm" placeholder="Delivery address" />
              <input name="city" required minLength={2} maxLength={80} placeholder="City" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
              <input name="postalCode" required minLength={4} maxLength={12} placeholder="Postal code" className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment method</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="flex cursor-not-allowed items-start gap-3 rounded-xl border border-gray-200 p-4 opacity-60">
                <input type="radio" name="paymentMethod" value="card" checked={paymentMethod === 'card'} disabled className="mt-0.5" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Credit / Debit Card</span>
                  <span className="mt-1 block text-xs text-gray-500">Online payment coming soon</span>
                </span>
              </label>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-0.5 accent-primary" />
                <span>
                  <span className="block text-sm font-semibold text-gray-900">Cash on Delivery</span>
                  <span className="mt-1 block text-xs text-gray-500">Pay when your order arrives</span>
                </span>
              </label>
            </div>

            <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">No online payment is needed. Pay ₹{total.toLocaleString()} to the delivery partner when your order arrives.</p>
          </div>
        </div>

        <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Order summary</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm text-gray-600">
                <span>{item.name} x {item.quantity}</span>
                <span>₹{(item.sellingPrice * item.quantity).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-gray-200 pt-4 text-sm text-gray-700">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span>₹{shipping.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Discount</span><span>₹0</span></div>
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-gray-200 pt-4">
            <span className="text-lg font-bold text-gray-900">Total</span>
            <span className="text-2xl font-bold text-gray-900">₹{total.toLocaleString()}</span>
          </div>

          {checkoutError && <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{checkoutError}</p>}
          <button type="submit" disabled={submitting || paymentMethod !== 'cod'} className="mt-6 w-full rounded-xl bg-primary px-4 py-3 font-semibold text-white hover:bg-primary-dark disabled:opacity-60">
            {submitting ? 'Placing order...' : 'Place COD order'}
          </button>
        </aside>
      </form>
    </main>
  );
}
