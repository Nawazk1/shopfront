import { Product } from '@/lib/catalogueStore';

export type CartItem = {
  productId: string;
  quantity: number;
};

const CART_KEY = 'shopfront_cart';
const WISHLIST_KEY = 'shopfront_wishlist';

function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const item = window.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new Event('shopfront:storage'));
  } catch {
    // ignore storage issues
  }
}

export function getCartItems(): CartItem[] {
  return readStorage<CartItem[]>(CART_KEY, []);
}

export function getWishlistIds(): string[] {
  return readStorage<string[]>(WISHLIST_KEY, []);
}

export function addToCart(productId: string, quantity = 1): CartItem[] {
  const items = getCartItems();
  const existing = items.find((item) => item.productId === productId);

  const updated = existing
    ? items.map((item) =>
        item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
      )
    : [...items, { productId, quantity }];

  writeStorage(CART_KEY, updated);
  return updated;
}

export function updateCartQuantity(productId: string, quantity: number): CartItem[] {
  const items = getCartItems();

  const updated = items
    .map((item) => (item.productId === productId ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeStorage(CART_KEY, updated);
  return updated;
}

export function removeFromCart(productId: string): CartItem[] {
  const updated = getCartItems().filter((item) => item.productId !== productId);
  writeStorage(CART_KEY, updated);
  return updated;
}

export function clearCart(): void {
  writeStorage(CART_KEY, []);
}

export function toggleWishlist(productId: string): string[] {
  const ids = getWishlistIds();
  const exists = ids.includes(productId);
  const updated = exists ? ids.filter((id) => id !== productId) : [...ids, productId];

  writeStorage(WISHLIST_KEY, updated);
  return updated;
}

export function getCartCount(): number {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}

export function getWishlistCount(): number {
  return getWishlistIds().length;
}

export function getCartProducts(products: Product[]): Array<Product & { quantity: number }> {
  return getCartItems()
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return { ...product, quantity: item.quantity };
    })
    .filter((item): item is Product & { quantity: number } => item !== null);
}

export function getWishlistProducts(products: Product[]): Product[] {
  const ids = getWishlistIds();
  return products.filter((product) => ids.includes(product.id));
}
