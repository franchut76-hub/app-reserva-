'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ClientsView({ initialClients }: { initialClients: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = initialClients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  )

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Directorio de Clientes</h1>
          <p className="text-stone-500">Historial y valor de vida de cada cliente (LTV).</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <input 
          type="text" 
          placeholder="Buscar por nombre, email o teléfono..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-sm uppercase tracking-wider">
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Contacto</th>
                <th className="pb-3 font-medium">Última Visita</th>
                <th className="pb-3 font-medium text-right">Total Citas</th>
                <th className="pb-3 font-medium text-right">Valor (LTV)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((client, i) => (
                <tr key={client.email} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="py-4 font-medium text-[#2c2c2c]">{client.name}</td>
                  <td className="py-4">
                    <div className="text-sm text-[#2c2c2c]">{client.email}</div>
                    <div className="text-sm text-stone-500">{client.phone || '-'}</div>
                  </td>
                  <td className="py-4 text-sm text-stone-600">
                    {format(parseISO(client.lastVisit), 'dd MMM yyyy', { locale: es })}
                  </td>
                  <td className="py-4 text-right font-medium text-[#2c2c2c]">{client.appointmentCount}</td>
                  <td className="py-4 text-right">
                    <span className="font-semibold text-[#c6a87c] bg-[#c6a87c]/10 px-3 py-1 rounded-full">
                      {client.totalSpent.toFixed(2)}€
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500">No se encontraron clientes.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
