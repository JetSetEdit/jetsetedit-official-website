import { NextResponse } from 'next/server';
import { verifyAdminRole } from '@/lib/middleware/adminAuth';
import { createApiResponse, handleApiError } from '@/lib/api/response';
import { auth, db } from '@/lib/server/firebase';

export async function GET() {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    // Get all users from Firebase Auth
    const { users } = await auth.listUsers();

    // Get additional user data from Firestore
    const userDocs = await Promise.all(
      users.map(user => db.collection('users').doc(user.uid).get())
    );

    const enrichedUsers = users.map((user, index) => ({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      customClaims: user.customClaims,
      metadata: user.metadata,
      ...(userDocs[index].exists ? userDocs[index].data() : {})
    }));

    return createApiResponse(enrichedUsers);

  } catch (error) {
    return handleApiError(error, 'Failed to list users');
  }
}

export async function POST(request: Request) {
  try {
    const session = await verifyAdminRole();
    if (session instanceof NextResponse) return session;

    const { email, password, displayName, role } = await request.json();

    if (!email || !password) {
      return createApiResponse({ error: 'Email and password are required' }, 400);
    }

    // Create user in Firebase Auth
    const user = await auth.createUser({
      email,
      password,
      displayName,
      emailVerified: false,
    });

    // Set custom claims if role is provided
    if (role) {
      await auth.setCustomUserClaims(user.uid, { role });
    }

    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email,
      displayName,
      role,
      createdAt: new Date().toISOString(),
      createdBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return createApiResponse({
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      role
    }, 201);

  } catch (error) {
    return handleApiError(error, 'Failed to create user');
  }
} 