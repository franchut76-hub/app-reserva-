import { getServicesAdmin } from '@/actions/admin-services'
import ServicesView from '@/components/admin/ServicesView'

export const metadata = {
  title: 'Servicios | Panel de Gestión',
}

export const dynamic = 'force-dynamic'

export default async function AdminServiciosPage() {
  const data = await getServicesAdmin()

  return <ServicesView initialServices={data || []} />
}
