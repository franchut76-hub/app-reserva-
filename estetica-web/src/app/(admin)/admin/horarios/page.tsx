import { getBusinessHoursAdmin } from '@/actions/admin-hours'
import HoursView from '@/components/admin/HoursView'

export const metadata = {
  title: 'Horarios | Panel de Gestión',
}

export const dynamic = 'force-dynamic'

export default async function AdminHorariosPage() {
  const data = await getBusinessHoursAdmin()

  return <HoursView initialHours={data || []} />
}
