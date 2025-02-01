import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bankConnections } from '@/lib/db/schema/bank-accounts';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const callbackSchema = z.object({
  connectionId: z.string(),
  userId: z.string(),
  status: z.string()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { connectionId, userId, status } = callbackSchema.parse(body);

    // Update the connection record
    await db
      .update(bankConnections)
      .set({
        basiqConnectionId: connectionId,
        status: status.toLowerCase(),
        updatedAt: new Date()
      })
      .where(eq(bankConnections.basiqUserId, userId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Callback processing error:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}