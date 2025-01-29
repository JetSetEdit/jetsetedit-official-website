import { db, clients } from '@/lib/db';
import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const latestClient = await db
      .select()
      .from(clients)
      .orderBy(desc(clients.id))
      .limit(1);

    return NextResponse.json({
      client: latestClient[0]
    });
  } catch (error) {
    console.error('Error fetching latest client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch latest client' },
      { status: 500 }
    );
  }
} 