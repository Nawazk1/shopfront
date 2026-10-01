import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import CataloguePage from '@/app/catalogue/page';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const sessionCookie = cookies().get('shopfront_admin_session')?.value;
  if (!sessionCookie) redirect('/admin/login');

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiBaseUrl}/api/admin/session`, {
      headers: { cookie: `shopfront_admin_session=${encodeURIComponent(sessionCookie)}` },
      cache: 'no-store',
    });
    if (!response.ok) redirect('/admin/login');
  } catch {
    redirect('/admin/login');
  }

  return <CataloguePage />;
}
