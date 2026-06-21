'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getServicesAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('services').select('*').order('created_at')
  return data
}

export async function upsertService(data: { id?: string, name: string, description: string, duration_minutes: number, price: number }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const payload = {
    name: data.name,
    description: data.description,
    duration_minutes: data.duration_minutes,
    price: data.price
  }

  let error;
  if (data.id) {
    ({ error } = await supabase.from('services').update(payload).eq('id', data.id))
  } else {
    ({ error } = await supabase.from('services').insert(payload))
  }

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/')
  revalidatePath('/reservar')
  revalidatePath('/admin/servicios')
  return { success: true }
}

export async function deleteService(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('services').delete().eq('id', id)
  if (error) return { success: false, error: error.message }
  
  revalidatePath('/')
  revalidatePath('/reservar')
  revalidatePath('/admin/servicios')
  return { success: true }
}
