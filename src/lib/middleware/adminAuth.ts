import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createApiResponse } from '../api/response';

export async function verifyAdminRole() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.role || session.user.role !== 'admin') {
    return createApiResponse({ error: 'Unauthorized' }, 401);
  }

  return session;
}

export type AdminSession = Awaited<ReturnType<typeof verifyAdminRole>>; 