import { db, clients } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const createClientSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  type: z.enum(['individual', 'business', 'agency']),
  website: z.string().url().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const body = createClientSchema.parse(json);

    const result = await db.insert(clients).values({
      name: body.name,
      company: body.company || null,
      email: body.email,
      phone: body.phone || null,
      type: body.type,
      website: body.website || null,
      notes: body.notes || null,
      status: 'active',
    });

    return NextResponse.json({ message: 'Client created successfully' }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid request data', errors: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating client:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const allClients = await db.select().from(clients);
    return NextResponse.json(allClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 