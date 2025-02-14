import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return createApiResponse({ error: 'Email and password are required' }, 400);
    }

    // Create user in Firebase Auth
    const user = await auth.createUser({
      email,
      password,
      displayName: name,
      emailVerified: false,
    });

    // Set default role
    await auth.setCustomUserClaims(user.uid, { role: 'client' });

    // Create user document in Firestore
    await db.collection('users').doc(user.uid).set({
      email,
      name,
      role: 'client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return createApiResponse({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      role: 'client'
    }, 201);

  } catch (error) {
    return handleApiError(error, 'Failed to create account');
  }
} 