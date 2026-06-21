'use server'

import { createClient } from '@/utils/supabase/server'
import { addMinutes, parse, format, isBefore, isEqual, isAfter } from 'date-fns'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getServices() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('services').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getAvailableSlots(dateStr: string, serviceId: string) {
  const supabase = await createClient()

  // 1. Obtener duración del servicio
  const { data: service, error: sErr } = await supabase.from('services').select('duration_minutes').eq('id', serviceId).single()
  if (sErr || !service) throw new Error('Servicio no encontrado')

  // 2. Obtener horario del día de la semana
  const dateObj = new Date(dateStr)
  // getDay() devuelve 0(Dom) a 6(Sab)
  const dayOfWeek = dateObj.getDay()
  
  const { data: hours, error: hErr } = await supabase.from('business_hours').select('*').eq('day_of_week', dayOfWeek).single()
  if (hErr || !hours) return [] // Cerrado este día

  // 3. Obtener citas del día
  const { data: appointments, error: aErr } = await supabase.from('appointments').select('start_time, services(duration_minutes)').eq('date', dateStr).eq('status', 'confirmed')
  if (aErr) throw new Error(aErr.message)

  // Parsear horas
  const openTime = parse(hours.open_time, 'HH:mm:ss', new Date())
  const closeTime = parse(hours.close_time, 'HH:mm:ss', new Date())
  
  const slots: string[] = []
  let currentTime = openTime

  while (isBefore(currentTime, closeTime)) {
    const slotEndTime = addMinutes(currentTime, service.duration_minutes)
    
    // Si el servicio termina después de la hora de cierre, no se puede
    if (isAfter(slotEndTime, closeTime)) {
      currentTime = addMinutes(currentTime, 30) // Avanzar 30 mins
      continue
    }

    // Comprobar solapamientos con otras citas
    let overlaps = false
    for (const appt of appointments || []) {
      const apptStartTime = parse(appt.start_time, 'HH:mm:ss', new Date())
      // @ts-ignore
      const apptDuration = appt.services?.duration_minutes || 0
      const apptEndTime = addMinutes(apptStartTime, apptDuration)

      // Un hueco se solapa si (inicio_hueco < fin_cita) Y (fin_hueco > inicio_cita)
      if (isBefore(currentTime, apptEndTime) && isAfter(slotEndTime, apptStartTime)) {
        overlaps = true
        break
      }
    }

    if (!overlaps) {
      slots.push(format(currentTime, 'HH:mm'))
    }

    currentTime = addMinutes(currentTime, 30)
  }

  return slots
}

export async function createBooking(data: { serviceId: string, date: string, time: string, name: string, email: string, phone: string }) {
  const supabase = await createClient()

  // Obtener el nombre del servicio primero (lectura pública permitida)
  const { data: serviceData } = await supabase.from('services').select('name').eq('id', data.serviceId).single()
  const serviceName = serviceData?.name || 'Servicio'

  // Guardar cita (sin .select() al final para no violar la política de lectura RLS)
  const { error } = await supabase.from('appointments').insert({
    service_id: data.serviceId,
    date: data.date,
    start_time: data.time + ':00',
    client_name: data.name,
    client_email: data.email,
    client_phone: data.phone,
    status: 'confirmed'
  })

  if (error) {
    return { success: false, error: error.message }
  }

  // Enviar email con Resend
  try {
    await resend.emails.send({
      from: 'Estética Web <onboarding@resend.dev>', // Usando el dominio de pruebas de Resend
      to: data.email,
      subject: 'Reserva Confirmada - Estética Web',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>¡Hola ${data.name}!</h2>
          <p>Tu reserva ha sido confirmada con éxito.</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fecha:</strong> ${data.date}</p>
            <p><strong>Hora:</strong> ${data.time}</p>
          </div>
          <p>Te esperamos. ¡Gracias por confiar en nosotros!</p>
        </div>
      `
    })
  } catch (emailErr) {
    console.error('Error enviando email:', emailErr)
    // No fallamos la reserva si el email falla
  }

  return { success: true }
}
