'use server';

import { deleteClientById } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function deleteClient(formData: FormData) {
  let id = Number(formData.get('id'));
  await deleteClientById(id);
  revalidatePath('/clients');
} 