import { getAppointmentsFull } from '@/actions/admin-appointments'
import { getServicesAdmin } from '@/actions/admin-services'
import AppointmentsView from '@/components/admin/AppointmentsView'

export const metadata = {
  title: 'Citas | Panel de Gestión',
}

export const dynamic = 'force-dynamic'

export default async function AdminCitasPage() {
  const data = await getAppointmentsFull()
  const services = await getServicesAdmin()

  return <AppointmentsView initialAppointments={data || []} services={services || []} />
}
