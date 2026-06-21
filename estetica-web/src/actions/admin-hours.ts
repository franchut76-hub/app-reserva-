'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export async function getBusinessHoursAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('business_hours').select('*').order('day_of_week')
  return data
}

export async function upsertBusinessHours(hours: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Clear existing and insert new
  await supabaseAdmin.from('business_hours').delete().neq('id', '00000000-0000-0000-0000-000000000000') // delete all hack
  
  const { error } = await supabaseAdmin.from('business_hours').insert(
    hours.map(h => ({
      day_of_week: h.day_of_week,
      open_time: h.open_time,
      close_time: h.close_time
    }))
  )

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/reservar')
  revalidatePath('/admin/horarios')
  return { success: true }
}
