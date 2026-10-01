export interface Customer {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  customerId: string;
  items: Array<{ productId: string; name: string; sku: string; quantity: number; unitPrice: number; lineTotal: number }>;
  shippingAddress: { address: string; city: string; postalCode: string };
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: 'cod';
  paymentStatus: 'due_on_delivery';
  status: string;
  createdAt: string;
}

export interface RegistrationResult {
  message: string;
  verificationRequired: boolean;
  developmentVerificationUrl?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    let message = text || 'Request failed';
    try {
      message = JSON.parse(text).message || message;
    } catch {
      // Keep non-JSON API messages readable.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function registerCustomer(name: string, email: string, password: string): Promise<RegistrationResult> {
  return authRequest<RegistrationResult>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginCustomer(email: string, password: string): Promise<Customer> {
  const result = await authRequest<{ customer: Customer }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return result.customer;
}

export async function getCustomerSession(): Promise<Customer> {
  const result = await authRequest<{ customer: Customer }>('/api/auth/session');
  return result.customer;
}

export async function logoutCustomer(): Promise<void> {
  await authRequest<void>('/api/auth/logout', { method: 'POST' });
}

export async function verifyCustomerEmail(token: string): Promise<Customer> {
  const result = await authRequest<{ customer: Customer }>('/api/auth/verify-email', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return result.customer;
}

export async function resendCustomerVerification(email: string): Promise<{ message: string; developmentVerificationUrl?: string }> {
  return authRequest('/api/auth/verification/resend', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function requestPasswordReset(email: string): Promise<{ message: string; developmentResetUrl?: string }> {
  return authRequest('/api/auth/password/forgot', { method: 'POST', body: JSON.stringify({ email }) });
}

export async function resetCustomerPassword(token: string, password: string): Promise<Customer> {
  const result = await authRequest<{ customer: Customer }>('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
  return result.customer;
}

export async function createCustomerOrder(data: {
  items: Array<{ productId: string; quantity: number }>;
  shippingAddress: { address: string; city: string; postalCode: string };
  paymentMethod: 'cod';
}): Promise<CustomerOrder> {
  const result = await authRequest<{ order: CustomerOrder }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.order;
}

export async function getCustomerOrders(): Promise<CustomerOrder[]> {
  return authRequest<CustomerOrder[]>('/api/orders');
}