import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { basiqClient } from '@/lib/basiq';
import { db } from '@/lib/db';
import { bankConnections } from '@/lib/db/schema/bank-accounts';
import { z } from 'zod';

const connectSchema = z.object({
  institutionId: z.string(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        details: 'User must be logged in with an email'
      }, { status: 401 });
    }

    const body = await request.json();
    const { institutionId } = connectSchema.parse(body);

    console.log('Creating/getting Basiq user for:', session.user.email);
    
    // Create or get Basiq user
    let basiqUserId;
    try {
      basiqUserId = await basiqClient.createUser(session.user.email);
    } catch (error) {
      console.error('Failed to create Basiq user:', error);
      return NextResponse.json({ 
        error: 'Failed to create Basiq user',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    console.log('Getting connection URL for institution:', institutionId);
    
    // Get connection URL
    let connectionUrl;
    try {
      connectionUrl = await basiqClient.createConnectionUrl(
        basiqUserId,
        institutionId
      );
    } catch (error) {
      console.error('Failed to create connection URL:', error);
      return NextResponse.json({ 
        error: 'Failed to create connection URL',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    // Get institution details
    const institutions = await basiqClient.getInstitutions();
    const institution = institutions.find(i => i.id === institutionId);

    if (!institution) {
      return NextResponse.json({ 
        error: 'Institution not found',
        details: `No institution found with ID: ${institutionId}`
      }, { status: 404 });
    }

    console.log('Creating bank connection record');
    
    // Create connection record
    try {
      await db.insert(bankConnections).values({
        basiqUserId,
        basiqConnectionId: null, // Will be updated after successful connection
        institutionId,
        institutionName: institution.name,
        status: 'pending',
        connectionData: institution,
      });
    } catch (error) {
      console.error('Failed to create bank connection record:', error);
      return NextResponse.json({ 
        error: 'Failed to create bank connection record',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }

    return NextResponse.json({ connectionUrl });
  } catch (error) {
    console.error('Failed to create connection:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 