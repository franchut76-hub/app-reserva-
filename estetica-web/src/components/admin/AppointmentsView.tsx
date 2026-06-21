'use client'

import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { updateAppointmentStatus, createManualAppointment } from '@/actions/admin-appointments'

export default function AppointmentsView({ initialAppointments, services }: { initialAppointments: any[], services: any[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('all') 
  const [search, setSearch] = useState('')
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', date: '', time: '10:00', serviceId: services[0]?.id || ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id)
    const res = await updateAppointmentStatus(id, newStatus)
    setLoadingId(null)
    
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a))
    } else {
      alert('Error: ' + res.error)
    }
  }

  const filtered = appointments.filter(a => {
    if (filter !== 'all' && a.status !== filter) return false
    if (search && !a.client_name.toLowerCase().includes(search.toLowerCase()) && !a.client_email.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const handleCreateManual = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const res = await createManualAppointment(formData)
    setIsSaving(false)
    if (res.success) {
      setIsModalOpen(false)
      window.location.reload() // Easiest way to fetch the newly created appointment with service relation
    } else {
      alert('Error: ' + res.error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium uppercase tracking-wider">Pendiente</span>
      case 'confirmed': return <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium uppercase tracking-wider">Confirmada</span>
      case 'completed': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium uppercase tracking-wider">Completada</span>
      case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium uppercase tracking-wider">Cancelada</span>
      case 'no_show': return <span className="px-3 py-1 bg-stone-200 text-stone-700 rounded-full text-xs font-medium uppercase tracking-wider">No-Show</span>
      default: return null
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Gestión de Citas</h1>
          <p className="text-stone-500">Administra, filtra y actualiza el estado de las reservas.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-[#2c2c2c] text-white rounded-xl text-sm uppercase tracking-widest hover:bg-black transition-colors"
        >
          Cita Manual
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Buscar por nombre o email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
          />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes</option>
            <option value="confirmed">Confirmadas</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">No-Show</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 text-sm uppercase tracking-wider">
                <th className="pb-3 font-medium">Fecha y Hora</th>
                <th className="pb-3 font-medium">Cliente</th>
                <th className="pb-3 font-medium">Servicio</th>
                <th className="pb-3 font-medium">Estado</th>
                <th className="pb-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(appt => (
                <tr key={appt.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
                  <td className="py-4">
                    <div className="font-medium text-[#2c2c2c]">{format(parseISO(appt.date), 'dd MMM yyyy', { locale: es })}</div>
                    <div className="text-sm text-stone-500">{appt.start_time.substring(0,5)}</div>
                  </td>
                  <td className="py-4">
                    <div className="font-medium text-[#2c2c2c]">{appt.client_name}</div>
                    <div className="text-sm text-stone-500">{appt.client_email}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-[#2c2c2c]">{appt.services?.name}</div>
                    <div className="text-sm font-medium text-[#c6a87c]">{appt.services?.price}€</div>
                  </td>
                  <td className="py-4">
                    {getStatusBadge(appt.status)}
                  </td>
                  <td className="py-4 text-right">
                    <select 
                      disabled={loadingId === appt.id}
                      onChange={(e) => handleStatusChange(appt.id, e.target.value)}
                      value={appt.status}
                      className="px-3 py-2 text-sm rounded-lg border border-stone-200 focus:outline-none disabled:opacity-50"
                    >
                      <option value="pending">Marcar Pendiente</option>
                      <option value="confirmed">Marcar Confirmada</option>
                      <option value="completed">Marcar Completada</option>
                      <option value="cancelled">Cancelar</option>
                      <option value="no_show">Marcar No-Show</option>
                    </select>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-stone-500">No se encontraron citas con estos filtros.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-xl">
            <h2 className="text-2xl font-serif mb-6 text-[#2c2c2c]">Crear Cita Manual</h2>
            <form onSubmit={handleCreateManual} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Fecha</label>
                  <input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Hora</label>
                  <input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"/>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Servicio</label>
                <select required value={formData.serviceId} onChange={e => setFormData({...formData, serviceId: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50">
                  {services.map(s => <option key={s.id} value={s.id}>{s.name} - {s.price}€</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Nombre Cliente</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
                  <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Teléfono</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"/>
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">Cancelar</button>
                <button type="submit" disabled={isSaving} className="flex-1 py-3 bg-[#c6a87c] text-white rounded-xl hover:bg-[#b0956b] transition-colors disabled:opacity-50">
                  {isSaving ? 'Guardando...' : 'Crear Cita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
