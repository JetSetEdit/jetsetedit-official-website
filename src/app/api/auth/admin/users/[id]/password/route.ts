import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { auth, db } from '@/lib/server/firebase';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { id } = params;
    const { newPassword } = await request.json();

    if (!newPassword) {
      return new NextResponse(
        JSON.stringify({ error: 'New password is required' }),
        { status: 400 }
      );
    }

    // Update user's password in Firebase Auth
    await auth.updateUser(id, {
      password: newPassword
    });

    // Log password change in Firestore
    await db.collection('users').doc(id).update({
      lastPasswordChangeAt: new Date().toISOString(),
      lastPasswordChangeBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error updating password:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to update password',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.role || session.user.role !== 'admin') {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    const { id } = params;

    // Generate password reset link
    const link = await auth.generatePasswordResetLink(id);

    // Log password reset request in Firestore
    await db.collection('users').doc(id).update({
      lastPasswordResetRequestAt: new Date().toISOString(),
      lastPasswordResetRequestBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return new NextResponse(
      JSON.stringify({ 
        success: true,
        resetLink: link
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error generating password reset link:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to generate password reset link',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
} 