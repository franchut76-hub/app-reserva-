import { getClientsAdmin } from '@/actions/admin-clients'
import ClientsView from '@/components/admin/ClientsView'

export const metadata = {
  title: 'Clientes | Panel de Gestión',
}

export const dynamic = 'force-dynamic'

export default async function AdminClientesPage() {
  const data = await getClientsAdmin()

  return <ClientsView initialClients={data || []} />
}
