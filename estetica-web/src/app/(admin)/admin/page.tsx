import { getDashboardMetrics } from '@/actions/dashboard'
import DashboardView from '@/components/admin/DashboardView'

export const metadata = {
  title: 'Dashboard | Panel de Gestión',
}

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const data = await getDashboardMetrics()

  return <DashboardView data={data} />
}
