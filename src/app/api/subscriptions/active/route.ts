import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401 }
      );
    }

    // For testing purposes, return the test subscription ID we created
    // In production, you would fetch this from your database based on the user's session
    return new NextResponse(
      JSON.stringify({
        subscriptionId: 'sub_1QqUQJAVc47ah8I12YRqktvJ' // This is the test subscription we created
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Error fetching active subscription:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch active subscription',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      }),
      { status: 500 }
    );
  }
} 