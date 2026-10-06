import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME, isValidSession } from '@/lib/auth';
import { AdminDashboard } from './AdminDashboard';
import { AdminLogin } from './AdminLogin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authed = isValidSession(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  return authed ? <AdminDashboard /> : <AdminLogin />;
}
