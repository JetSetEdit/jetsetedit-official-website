import { NextResponse } from 'next/server';
import { basiqClient } from '@/lib/basiq';

export async function GET() {
  try {
    // Fetch institutions from Basiq
    const institutions = await basiqClient.getInstitutions();
    return NextResponse.json(institutions);
  } catch (error: any) {
    console.error('Failed to fetch institutions:', error);
    return new NextResponse(
      JSON.stringify({
        error: error.message || 'Internal Server Error',
        details: error.details || null
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 