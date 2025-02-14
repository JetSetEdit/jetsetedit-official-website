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

    // Disable user in Firebase Auth
    await auth.updateUser(id, { disabled: true });

    // Update user document in Firestore
    await db.collection('users').doc(id).update({
      disabled: true,
      disabledAt: new Date().toISOString(),
      disabledBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error disabling user:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to disable user',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Re-enable user in Firebase Auth
    await auth.updateUser(id, { disabled: false });

    // Update user document in Firestore
    await db.collection('users').doc(id).update({
      disabled: false,
      enabledAt: new Date().toISOString(),
      enabledBy: session.user.id,
      updatedAt: new Date().toISOString()
    });

    return new NextResponse(
      JSON.stringify({ success: true }),
      { status: 200 }
    );

  } catch (error) {
    console.error('Error enabling user:', error);
    return new NextResponse(
      JSON.stringify({
        error: 'Failed to enable user',
        details: process.env.NODE_ENV === 'development' ? 
          error instanceof Error ? error.message : 'Unknown error' 
          : undefined
      }),
      { status: 500 }
    );
  }
} 