import { NextResponse } from 'next/server';
import { auth } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return createApiResponse({ error: 'Email is required' }, 400);
    }

    // Generate email verification link
    const link = await auth.generateEmailVerificationLink(email);

    // TODO: Send verification email
    // For now, return the link directly (in production, you should never do this)
    return createApiResponse({ verificationLink: link });

  } catch (error) {
    return handleApiError(error, 'Failed to verify email');
  }
}

export async function PUT(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return createApiResponse({ error: 'Email is required' }, 400);
    }

    // Generate new verification link
    const link = await auth.generateEmailVerificationLink(email);

    // TODO: Send verification email
    // For now, return the link directly (in production, you should never do this)
    return createApiResponse({ verificationLink: link });

  } catch (error) {
    return handleApiError(error, 'Failed to generate verification link');
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return createApiResponse({ error: 'Email is required' }, 400);
    }

    // Generate new verification link
    const link = await auth.generateEmailVerificationLink(email);

    // TODO: Send verification email
    // For now, return the link directly (in production, you should never do this)
    return createApiResponse({ verificationLink: link });

  } catch (error) {
    return handleApiError(error, 'Failed to generate verification link');
  }
} 