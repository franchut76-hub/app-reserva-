'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getAppointmentsFull() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('appointments')
    .select('*, services(*)')
    .order('date', { ascending: false })
    .order('start_time', { ascending: false })

  return data
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/admin/citas')
  return { success: true }
}

export async function createManualAppointment(data: { serviceId: string, date: string, time: string, name: string, email: string, phone: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('appointments').insert({
    service_id: data.serviceId,
    date: data.date,
    start_time: data.time + ':00',
    client_name: data.name,
    client_email: data.email,
    client_phone: data.phone,
    status: 'confirmed'
  })

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin')
  revalidatePath('/admin/citas')
  return { success: true }
}
