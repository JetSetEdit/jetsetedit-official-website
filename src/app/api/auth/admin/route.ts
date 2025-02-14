import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auth } from '@/lib/server/firebase';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { email, role } = await request.json();

    if (!email || !role) {
      return new NextResponse(
        JSON.stringify({ error: 'Email and role are required' }),
        { status: 400 }
      );
    }

    // Get user by email
    const user = await auth.getUserByEmail(email);

    // Update custom claims
    await auth.setCustomUserClaims(user.uid, {
      ...user.customClaims,
      role
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating user role:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update user role',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return new NextResponse(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400 }
      );
    }

    // Get user by email
    const user = await auth.getUserByEmail(email);

    return new NextResponse(
      JSON.stringify({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        customClaims: user.customClaims
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error getting user details:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to get user details',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
} 