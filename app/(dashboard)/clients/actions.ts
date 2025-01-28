'use server';

import { deleteClientById } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { db, clients } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function getClient(id: number) {
  try {
    const client = await db.select().from(clients).where(eq(clients.id, id)).limit(1);
    return { client: client[0] };
  } catch (error) {
    return { error: 'Failed to fetch client' };
  }
}

export async function updateClient(formData: FormData) {
  try {
    const id = Number(formData.get('id'));
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const company = formData.get('company') as string;
    const type = formData.get('type') as 'business' | 'individual' | 'agency';
    const status = formData.get('status') as 'active' | 'inactive';
    const notes = formData.get('notes') as string;

    await db.update(clients)
      .set({
        name,
        email,
        phone,
        company,
        type,
        status,
        notes
      })
      .where(eq(clients.id, id));

    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to update client' };
  }
}

export async function deleteClient(formData: FormData) {
  try {
    const id = Number(formData.get('id'));
    await db.delete(clients).where(eq(clients.id, id));
    revalidatePath('/clients');
    return { success: true };
  } catch (error) {
    return { error: 'Failed to delete client' };
  }
} 