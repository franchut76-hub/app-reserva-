'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'Credenciales inválidas' }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getAppointments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name)')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function cancelAppointment(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', id)
  
  if (error) return { success: false, error: error.message }
  return { success: true }
}
