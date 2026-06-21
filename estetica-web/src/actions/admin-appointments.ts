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

export async function sendReminderEmail(appointmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: appt, error: apptError } = await supabase
    .from('appointments')
    .select('*, services(name)')
    .eq('id', appointmentId)
    .single()

  if (apptError || !appt) return { success: false, error: 'Cita no encontrada' }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(process.env.RESEND_API_KEY)
    
    // @ts-ignore
    const serviceName = appt.services?.name || 'Servicio'

    await resend.emails.send({
      from: 'Estética Web <onboarding@resend.dev>',
      to: appt.client_email,
      subject: 'Recordatorio de Cita - Estética Web',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${appt.client_name}!</h2>
          <p>Te recordamos que tienes una cita programada con nosotros próximamente.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fecha:</strong> ${appt.date}</p>
            <p><strong>Hora:</strong> ${appt.start_time.substring(0,5)}</p>
          </div>
          <p>Por favor, si no puedes asistir, avísanos con antelación.</p>
          <p>¡Te esperamos!</p>
        </div>
      `
    })

    return { success: true }
  } catch (emailErr: any) {
    console.error('Error enviando recordatorio:', emailErr)
    return { success: false, error: emailErr.message }
  }
}
