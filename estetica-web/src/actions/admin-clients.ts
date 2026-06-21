'use server'

import { createClient } from '@/utils/supabase/server'

export async function getClientsAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Fetch all appointments that are completed
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, services(price)')
    
  if (!appointments) return []

  const clientsMap = new Map()

  appointments.forEach(a => {
    const email = a.client_email
    if (!clientsMap.has(email)) {
      clientsMap.set(email, {
        name: a.client_name,
        email: email,
        phone: a.client_phone,
        totalSpent: 0,
        appointmentCount: 0,
        lastVisit: a.date
      })
    }
    
    const client = clientsMap.get(email)
    client.appointmentCount += 1
    
    if (a.status === 'completed') {
      client.totalSpent += Number(a.services?.price || 0)
    }

    if (new Date(a.date) > new Date(client.lastVisit)) {
      client.lastVisit = a.date
      // Update name/phone to latest
      client.name = a.client_name
      client.phone = a.client_phone
    }
  })

  return Array.from(clientsMap.values()).sort((a, b) => b.totalSpent - a.totalSpent)
}
