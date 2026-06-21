import Link from 'next/link'
import { logout } from '@/actions/admin'
import { LayoutDashboard, CalendarDays, Scissors, Clock, Users, LogOut } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const menu = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Citas', href: '/admin/citas', icon: CalendarDays },
    { name: 'Servicios', href: '/admin/servicios', icon: Scissors },
    { name: 'Horarios', href: '/admin/horarios', icon: Clock },
    { name: 'Clientes', href: '/admin/clientes', icon: Users },
  ]

  return (
    <div className="min-h-screen bg-[#f7f5f2] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200 flex flex-col md:min-h-screen md:sticky md:top-0">
        <div className="p-6 border-b border-stone-200">
          <h2 className="text-xl font-serif text-[#2c2c2c]">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-x-auto md:overflow-visible flex md:flex-col">
          {menu.map(item => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-stone-600 hover:bg-stone-50 hover:text-[#c6a87c] rounded-xl transition-colors whitespace-nowrap"
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-stone-200">
          <form action={logout}>
            <button className="flex w-full items-center gap-3 px-4 py-3 text-stone-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium text-sm">Cerrar Sesión</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
