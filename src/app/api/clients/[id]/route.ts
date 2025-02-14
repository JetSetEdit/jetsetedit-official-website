import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { id } = params;

    // Get client from Firestore
    const clientDoc = await db.collection('clients').doc(id).get();

    if (!clientDoc.exists) {
      return createApiResponse({ error: 'Client not found' }, 404);
    }

    return createApiResponse({
      id: clientDoc.id,
      ...clientDoc.data()
    });

  } catch (error) {
    return handleApiError(error, 'Failed to fetch client');
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { id } = params;
    const updates = await request.json();

    // Update client in Firestore
    await db.collection('clients').doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id
    });

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to update client');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { id } = params;

    // Delete client from Firestore
    await db.collection('clients').doc(id).delete();

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to delete client');
  }
} 