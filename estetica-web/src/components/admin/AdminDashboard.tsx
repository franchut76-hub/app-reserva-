'use client'

import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { cancelAppointment, logout } from '@/actions/admin'
import { sendReminderEmail } from '@/actions/admin-appointments'

export default function AdminDashboard({ initialAppointments }: { initialAppointments: any[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleCancel = async (id: string) => {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return
    
    setLoadingId(id)
    const res = await cancelAppointment(id)
    setLoadingId(null)
    
    if (res.success) {
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a))
    } else {
      alert('Error cancelando la cita: ' + res.error)
    }
  }

  const handleSendReminder = async (id: string) => {
    if (window.confirm('¿Seguro que quieres enviar un correo de recordatorio a este cliente?')) {
      const res = await sendReminderEmail(id)
      if (res.success) {
        alert('Recordatorio enviado con éxito.')
      } else {
        alert('Error al enviar recordatorio: ' + res.error)
      }
    }
  }

  const upcoming = appointments.filter(a => a.status === 'confirmed')
  const cancelled = appointments.filter(a => a.status === 'cancelled')

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-serif text-[#2c2c2c]">Panel de Gestión</h1>
          <button 
            onClick={() => logout()}
            className="text-sm font-medium text-stone-500 hover:text-red-500 transition-colors uppercase tracking-wider"
          >
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-serif text-[#2c2c2c] mb-6">Próximas Citas ({upcoming.length})</h2>
          
          {upcoming.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center shadow-sm border border-stone-100 text-stone-500">
              No tienes citas próximas.
            </div>
          ) : (
            <div className="grid gap-4">
              {upcoming.map(appt => (
                <div key={appt.id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex gap-6 items-center">
                    <div className="bg-[#c6a87c]/10 text-[#c6a87c] w-20 h-20 rounded-xl flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-sm uppercase font-semibold">{format(parseISO(appt.date), 'MMM', { locale: es })}</span>
                      <span className="text-2xl font-serif leading-none">{format(parseISO(appt.date), 'dd')}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-serif text-[#2c2c2c]">{appt.client_name}</h3>
                      <div className="text-stone-500 text-sm mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>{appt.start_time.substring(0, 5)}</span>
                        <span>•</span>
                        <span>{appt.services?.name}</span>
                        <span>•</span>
                        <span>{appt.client_phone}</span>
                      </div>
                      <div className="text-stone-400 text-xs mt-1">{appt.client_email}</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSendReminder(appt.id)}
                      className="px-6 py-3 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-xl transition-colors text-sm font-medium uppercase tracking-wider"
                    >
                      Recordatorio
                    </button>
                    <button 
                      onClick={() => handleCancel(appt.id)}
                      disabled={loadingId === appt.id}
                      className="px-6 py-3 border border-red-200 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium uppercase tracking-wider disabled:opacity-50"
                    >
                      {loadingId === appt.id ? '...' : 'Cancelar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cancelled.length > 0 && (
          <div className="opacity-60">
            <h2 className="text-xl font-serif text-[#2c2c2c] mb-6">Citas Canceladas</h2>
            <div className="grid gap-4">
              {cancelled.map(appt => (
                <div key={appt.id} className="bg-stone-100 p-6 rounded-2xl flex md:items-center justify-between gap-6 grayscale">
                  <div>
                    <h3 className="text-lg font-serif">{appt.client_name}</h3>
                    <p className="text-stone-500 text-sm">{format(parseISO(appt.date), 'dd/MM/yyyy')} a las {appt.start_time.substring(0, 5)}</p>
                  </div>
                  <span className="text-xs uppercase tracking-wider text-stone-500 font-semibold px-3 py-1 bg-stone-200 rounded-full">Cancelada</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
