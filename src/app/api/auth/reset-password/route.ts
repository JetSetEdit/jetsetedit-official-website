import { NextResponse } from 'next/server';
import { auth } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return createApiResponse({ error: 'Email is required' }, 400);
    }

    // Generate password reset link
    const link = await auth.generatePasswordResetLink(email);

    // TODO: Send email with reset link
    // For now, return the link directly (in production, you should never do this)
    return createApiResponse({ resetLink: link });

  } catch (error) {
    return handleApiError(error, 'Failed to generate password reset link');
  }
}

export async function PUT(request: Request) {
  try {
    const { email, newPassword } = await request.json();

    if (!email || !newPassword) {
      return createApiResponse({ error: 'Email and new password are required' }, 400);
    }

    // Get user by email
    const user = await auth.getUserByEmail(email);

    // Update the password
    await auth.updateUser(user.uid, {
      password: newPassword,
      emailVerified: true
    });

    return createApiResponse({ success: true });

  } catch (error) {
    return handleApiError(error, 'Failed to update password');
  }
} 