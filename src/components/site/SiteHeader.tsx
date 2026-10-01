'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { getCartCount, getWishlistCount } from '@/lib/shopHelpers';
import { Customer, getCustomerSession } from '@/lib/customerAuth';

const navigation = [
  { href: '/products', label: 'Shop all' },
  { href: '/categories', label: 'Categories' },
  { href: '/offers', label: 'Offers' },
  { href: '/about', label: 'Our story' },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    const updateCounts = () => {
      setCartCount(getCartCount());
      setWishlistCount(getWishlistCount());
    };

    updateCounts();
    window.addEventListener('shopfront:storage', updateCounts);

    return () => {
      window.removeEventListener('shopfront:storage', updateCounts);
    };
  }, []);

  useEffect(() => {
    let active = true;
    void getCustomerSession()
      .then(session => { if (active) setCustomer(session); })
      .catch(() => { if (active) setCustomer(null); });
    return () => { active = false; };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-canvas/95 backdrop-blur-md">
      <div className="border-b border-black/5 bg-primary px-4 py-2 text-center text-xs font-medium tracking-wide text-white">
        Good things, delivered to your door
      </div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ShopFront home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
            <Icon name="ShoppingBagIcon" size={18} />
          </span>
          <span className="font-serif text-xl font-bold tracking-tight text-ink">ShopFront</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href === '/products' && pathname.startsWith('/product/'));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  active ? 'text-primary' : 'text-gray-600 hover:text-primary'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={customer ? '/account' : '/login'} aria-label={customer ? 'Your account' : 'Sign in'} title={customer ? 'Your account' : 'Sign in'} className="inline-flex h-10 items-center gap-2 rounded-lg px-2 text-gray-700 transition hover:bg-white hover:text-primary">
            <Icon name="UserCircleIcon" size={20} />
            <span className="hidden text-sm font-medium sm:inline">{customer ? 'Account' : 'Sign in'}</span>
          </Link>
          <Link href="/wishlist" aria-label={`Wishlist${wishlistCount ? `, ${wishlistCount} items` : ''}`} title="Wishlist" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 transition hover:bg-white hover:text-primary">
            <Icon name="HeartIcon" size={18} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link href="/cart" aria-label={`Cart${cartCount ? `, ${cartCount} items` : ''}`} title="Cart" className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white transition hover:bg-primary-dark">
            <Icon name="ShoppingCartIcon" size={18} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
      <nav aria-label="Main navigation" className="flex gap-6 overflow-x-auto border-t border-black/5 px-4 py-2.5 text-sm md:hidden">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href} className={`shrink-0 font-medium ${pathname === item.href ? 'text-primary' : 'text-gray-600'}`}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
