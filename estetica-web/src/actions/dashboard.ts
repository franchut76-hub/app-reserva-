'use server'

import { createClient } from '@/utils/supabase/server'
import { format, subDays, startOfDay, endOfDay, isSameDay, startOfMonth, endOfMonth, parseISO } from 'date-fns'

export async function getDashboardMetrics() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Fetch all appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('*, services(*)')
    
  if (!appointments) return null

  const today = new Date()
  const todayStart = startOfDay(today)
  const todayEnd = endOfDay(today)
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)

  // KPIs
  const todayAppointments = appointments.filter(a => {
    const date = parseISO(a.date)
    return date >= todayStart && date <= todayEnd
  }).length

  const thisWeekAppointments = appointments.filter(a => {
    const date = parseISO(a.date)
    return date >= subDays(today, 7) && date <= todayEnd
  }).length

  const completedThisMonth = appointments.filter(a => {
    const date = parseISO(a.date)
    return date >= monthStart && date <= monthEnd && a.status === 'completed'
  })

  const monthlyRevenue = completedThisMonth.reduce((acc, curr) => acc + Number(curr.services?.price || 0), 0)
  
  const averageTicket = completedThisMonth.length > 0 
    ? monthlyRevenue / completedThisMonth.length 
    : 0

  // Revenue by Day (last 14 days)
  const revenueByDayMap = new Map()
  for (let i = 13; i >= 0; i--) {
    const d = subDays(today, i)
    revenueByDayMap.set(format(d, 'yyyy-MM-dd'), { date: format(d, 'dd MMM'), income: 0 })
  }

  appointments.forEach(a => {
    if (a.status === 'completed') {
      const dateKey = a.date
      if (revenueByDayMap.has(dateKey)) {
        const item = revenueByDayMap.get(dateKey)
        item.income += Number(a.services?.price || 0)
      }
    }
  })

  // Popular Services
  const servicesMap = new Map()
  appointments.forEach(a => {
    const name = a.services?.name || 'Desconocido'
    servicesMap.set(name, (servicesMap.get(name) || 0) + 1)
  })
  
  const popularService = Array.from(servicesMap.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'

  const servicesData = Array.from(servicesMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    kpis: {
      todayAppointments,
      thisWeekAppointments,
      monthlyRevenue,
      averageTicket,
      popularService
    },
    revenueByDay: Array.from(revenueByDayMap.values()),
    servicesData
  }
}
