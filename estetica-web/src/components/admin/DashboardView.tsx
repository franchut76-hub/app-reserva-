'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function DashboardView({ data }: { data: any }) {
  if (!data) return <div>Cargando dashboard...</div>

  const { kpis, revenueByDay, servicesData } = data

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Resumen de Negocio</h1>
        <p className="text-stone-500">Métricas y facturación en tiempo real.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-sm font-medium mb-1">Citas Hoy</p>
          <p className="text-3xl font-serif text-[#2c2c2c]">{kpis.todayAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-sm font-medium mb-1">Citas Semana</p>
          <p className="text-3xl font-serif text-[#2c2c2c]">{kpis.thisWeekAppointments}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-sm font-medium mb-1">Facturación Mes</p>
          <p className="text-3xl font-serif text-[#c6a87c]">{kpis.monthlyRevenue.toFixed(2)}€</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-stone-500 text-sm font-medium mb-1">Ticket Medio</p>
          <p className="text-3xl font-serif text-[#2c2c2c]">{kpis.averageTicket.toFixed(2)}€</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <h3 className="font-serif text-xl mb-6">Facturación (Últimos 14 días)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} tickFormatter={(val) => `€${val}`} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="income" fill="#c6a87c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
          <h3 className="font-serif text-xl mb-6">Servicios Populares</h3>
          <div className="flex-1 space-y-6">
            {servicesData.map((s: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-stone-700">{s.name}</span>
                  <span className="text-stone-500">{s.count} citas</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#2c2c2c] rounded-full" 
                    style={{ width: `${(s.count / Math.max(...servicesData.map((x:any) => x.count))) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
