import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900">ShopFront</h3>
          <p className="mt-3 text-sm text-gray-600">Your everyday destination for fashion, home, and essential products.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Quick links</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <Link href="/products" className="block hover:text-primary">Products</Link>
            <Link href="/offers" className="block hover:text-primary">Offers</Link>
            <Link href="/categories" className="block hover:text-primary">Categories</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Company</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <Link href="/about" className="block hover:text-primary">About us</Link>
            <Link href="/contact" className="block hover:text-primary">Contact</Link>
            <Link href="/faq" className="block hover:text-primary">FAQ</Link>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-700">Customer care</h4>
          <div className="mt-3 space-y-2 text-sm text-gray-600">
            <Link href="/orders" className="block hover:text-primary">Orders</Link>
            <Link href="/account" className="block hover:text-primary">Account</Link>
            <Link href="/wishlist" className="block hover:text-primary">Wishlist</Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 text-xs text-gray-500 sm:px-6 lg:px-8">
          <p>© 2024 ShopFront. All rights reserved.</p>
          <p>Secure payments • Fast delivery</p>
        </div>
      </div>
    </footer>
  );
}
