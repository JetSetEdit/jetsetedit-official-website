import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { clients } from '@/lib/db';
import { and, ne, eq } from 'drizzle-orm';

export async function DELETE() {
  try {
    // First, find David Morehouse's ID
    const [davidMorehouse] = await db
      .select()
      .from(clients)
      .where(eq(clients.name, 'David Morehouse'));

    if (!davidMorehouse) {
      return NextResponse.json(
        { error: 'David Morehouse not found' },
        { status: 404 }
      );
    }

    // Delete all clients except David Morehouse
    const result = await db
      .delete(clients)
      .where(ne(clients.id, davidMorehouse.id));

    return NextResponse.json({ message: 'All other clients deleted successfully' });
  } catch (error) {
    console.error('Error deleting clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete clients' },
      { status: 500 }
    );
  }
} 