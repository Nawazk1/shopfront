'use client';

export type ProductStatus = 'published' | 'draft';
export type StockStatus = 'in_stock' | 'out_of_stock' | 'low_stock';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isMain: boolean;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  subCategory: string;
  brand: string;
  sellingPrice: number;
  mrp: number;
  discount: number;
  taxGst: number;
  stockQuantity: number;
  stockStatus: StockStatus;
  minimumOrderQuantity: number;
  images: ProductImage[];
  color: string;
  size: string;
  material: string;
  weight: string;
  dimensions: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  urlSlug: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || 'Request failed';
    try {
      message = JSON.parse(errorText).message || message;
    } catch {
      // Keep non-JSON server errors readable as returned.
    }
    throw new Error(message);
  }

  const text = await response.text();
  return text ? (JSON.parse(text) as T) : (null as T);
}

export async function getProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/products');
}

export async function getAdminProducts(): Promise<Product[]> {
  return apiFetch<Product[]>('/api/admin/products');
}

export async function getAdminSession(): Promise<{ email: string; role: 'admin' }> {
  return apiFetch<{ email: string; role: 'admin' }>('/api/admin/session');
}

export async function loginAdmin(email: string, password: string): Promise<{ email: string; role: 'admin' }> {
  return apiFetch<{ email: string; role: 'admin' }>('/api/admin/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function logoutAdmin(): Promise<void> {
  await apiFetch<void>('/api/admin/logout', { method: 'POST' });
}

export async function getPublishedProducts(): Promise<Product[]> {
  const products = await getProducts();
  return products.filter((p) => p.status === 'published');
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function addProduct(data: ProductFormData): Promise<Product> {
  return apiFetch<Product>('/api/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Partial<ProductFormData>): Promise<Product | null> {
  return apiFetch<Product>(`/api/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/api/admin/products/${id}`, { method: 'DELETE', credentials: 'include' });
  if (!response.ok) {
    const errorText = await response.text();
    let message = errorText || 'Could not delete product';
    try {
      message = JSON.parse(errorText).message || message;
    } catch {
      // Keep non-JSON server errors readable as returned.
    }
    throw new Error(message);
  }
  return response.ok;
}

export async function toggleProductStatus(id: string): Promise<Product | null> {
  return apiFetch<Product>(`/api/admin/products/${id}/toggle-status`, {
    method: 'PATCH',
  });
}

export const CATEGORIES = [
  'Clothing',
  'Footwear',
  'Electronics',
  'Accessories',
  'Home & Kitchen',
  'Sports & Fitness',
  'Beauty & Personal Care',
  'Books',
  'Toys & Games',
  'Automotive',
];

export const SUB_CATEGORIES: Record<string, string[]> = {
  Clothing: ['T-Shirts', 'Jeans', 'Shirts', 'Dresses', 'Jackets', 'Sweaters'],
  Footwear: ['Sports Shoes', 'Casual Shoes', 'Formal Shoes', 'Sandals', 'Boots'],
  Electronics: ['Audio', 'Mobile', 'Laptops', 'Cameras', 'Accessories'],
  Accessories: ['Wallets', 'Bags', 'Belts', 'Watches', 'Sunglasses'],
  'Home & Kitchen': ['Cookware', 'Furniture', 'Decor', 'Bedding', 'Storage'],
  'Sports & Fitness': ['Gym Equipment', 'Outdoor', 'Yoga', 'Cycling', 'Swimming'],
  'Beauty & Personal Care': ['Skincare', 'Haircare', 'Makeup', 'Fragrances'],
  Books: ['Fiction', 'Non-Fiction', 'Academic', 'Children'],
  'Toys & Games': ['Action Figures', 'Board Games', 'Puzzles', 'Educational'],
  Automotive: ['Car Accessories', 'Bike Accessories', 'Tools'],
};