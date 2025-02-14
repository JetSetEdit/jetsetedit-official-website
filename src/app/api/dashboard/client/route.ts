import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/server/firebase';
import { createApiResponse, handleApiError } from '@/lib/api/response';

interface Client {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface Ticket {
  id: string;
  clientId: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return createApiResponse({ error: 'Unauthorized' }, 401);
    }

    // Get client data from Firestore
    const clientDoc = await db.collection('clients')
      .where('email', '==', session.user.email)
      .limit(1)
      .get();

    if (clientDoc.empty) {
      return createApiResponse({ error: 'Client not found' }, 404);
    }

    const client = {
      id: clientDoc.docs[0].id,
      ...clientDoc.docs[0].data()
    } as Client;

    // Get client's projects
    const projectsSnapshot = await db.collection('projects')
      .where('clientId', '==', client.id)
      .get();

    const projects = projectsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Project[];

    // Get client's tickets
    const ticketsSnapshot = await db.collection('tickets')
      .where('clientId', '==', client.id)
      .get();

    const tickets = ticketsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Ticket[];

    return createApiResponse({
      client,
      projects,
      tickets,
      stats: {
        activeProjects: projects.filter(p => p.status === 'active').length,
        openTickets: tickets.filter(t => t.status === 'open').length,
        completedProjects: projects.filter(p => p.status === 'completed').length
      }
    });

  } catch (error) {
    return handleApiError(error, 'Failed to fetch dashboard data');
  }
} 