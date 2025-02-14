import { NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { auth, db } from '@/lib/server/firebase';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { id } = params;

    // Get user from Firebase Auth
    const user = await auth.getUser(id);

    // Get additional user data from Firestore
    const userDoc = await db.collection('users').doc(id).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    return createApiResponse({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims,
      metadata: user.metadata,
      ...userData
    });

  } catch (error) {
    return handleApiError(error, 'Failed to get user');
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
    const { displayName, role, emailVerified } = await request.json();

    // Update user in Firebase Auth
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (emailVerified !== undefined) updateData.emailVerified = emailVerified;

    const user = await auth.updateUser(id, updateData);

    // Update custom claims if role is provided
    if (role !== undefined) {
      await auth.setCustomUserClaims(id, { 
        ...user.customClaims,
        role 
      });
    }

    // Update user document in Firestore
    await db.collection('users').doc(id).update({
      ...updateData,
      ...(role && { role }),
      updatedAt: new Date().toISOString()
    });

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to update user');
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

    // Delete user from Firebase Auth
    await auth.deleteUser(id);

    // Delete user document from Firestore
    await db.collection('users').doc(id).delete();

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to delete user');
  }
} 