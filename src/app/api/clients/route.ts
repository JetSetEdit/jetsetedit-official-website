import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';

export async function GET() {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    // Get all clients from Firestore
    const clientsSnapshot = await db.collection('clients').get();
    
    const clients = clientsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return createApiResponse(clients);

  } catch (error) {
    return handleApiError(error, 'Failed to fetch clients');
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const data = await request.json();
    const { name, email } = data;

    if (!name || !email) {
      return createApiResponse({ error: 'Name and email are required' }, 400);
    }

    // Create client in Firestore
    const clientRef = await db.collection('clients').add({
      name,
      email,
      status: 'Active',
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return createApiResponse({
      id: clientRef.id,
      name,
      email,
      status: 'Active'
    }, 201);

  } catch (error) {
    return handleApiError(error, 'Failed to create client');
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return createApiResponse({ error: 'Client ID is required' }, 400);
    }

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

export async function PUT(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const data = await request.json();
    const { id, ...updates } = data;

    if (!id) {
      return createApiResponse({ error: 'Client ID is required' }, 400);
    }

    // Replace client document in Firestore
    await db.collection('clients').doc(id).set({
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.id
    });

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to update client');
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createApiResponse({ error: 'Client ID is required' }, 400);
    }

    // Delete client from Firestore
    await db.collection('clients').doc(id).delete();

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to delete client');
  }
} 