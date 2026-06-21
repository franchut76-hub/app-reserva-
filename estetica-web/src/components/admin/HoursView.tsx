'use client'

import { useState } from 'react'
import { upsertBusinessHours } from '@/actions/admin-hours'

export default function HoursView({ initialHours }: { initialHours: any[] }) {
  // Configuración predeterminada de la semana (0 = Domingo, 6 = Sábado)
  const defaultWeek = [
    { day_of_week: 1, name: 'Lunes', active: true, open_time: '10:00:00', close_time: '20:00:00' },
    { day_of_week: 2, name: 'Martes', active: true, open_time: '10:00:00', close_time: '20:00:00' },
    { day_of_week: 3, name: 'Miércoles', active: true, open_time: '10:00:00', close_time: '20:00:00' },
    { day_of_week: 4, name: 'Jueves', active: true, open_time: '10:00:00', close_time: '20:00:00' },
    { day_of_week: 5, name: 'Viernes', active: true, open_time: '10:00:00', close_time: '20:00:00' },
    { day_of_week: 6, name: 'Sábado', active: true, open_time: '10:00:00', close_time: '14:00:00' },
    { day_of_week: 0, name: 'Domingo', active: false, open_time: '10:00:00', close_time: '20:00:00' },
  ]

  const [hours, setHours] = useState(() => {
    return defaultWeek.map(dw => {
      const existing = initialHours.find(h => h.day_of_week === dw.day_of_week)
      if (existing) {
        return { ...dw, active: true, open_time: existing.open_time, close_time: existing.close_time }
      }
      return { ...dw, active: false }
    })
  })

  const [loading, setLoading] = useState(false)

  const handleToggle = (index: number) => {
    const newHours = [...hours]
    newHours[index].active = !newHours[index].active
    setHours(newHours)
  }

  const handleChange = (index: number, field: 'open_time' | 'close_time', value: string) => {
    const newHours = [...hours]
    newHours[index][field] = value + ':00' // Ensure HH:MM:SS format
    setHours(newHours)
  }

  const handleSave = async () => {
    setLoading(true)
    const activeHours = hours.filter(h => h.active).map(h => ({
      day_of_week: h.day_of_week,
      open_time: h.open_time,
      close_time: h.close_time
    }))

    const res = await upsertBusinessHours(activeHours)
    setLoading(false)
    if (res.success) {
      alert('Horarios actualizados correctamente.')
    } else {
      alert('Error: ' + res.error)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Horarios de Apertura</h1>
          <p className="text-stone-500">Configura los días y horas en los que se aceptan reservas.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="px-8 py-3 bg-[#c6a87c] text-white rounded-xl text-sm font-medium uppercase tracking-widest hover:bg-[#b0956b] transition-colors disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        {hours.map((h, i) => (
          <div key={h.day_of_week} className="flex items-center justify-between p-6 border-b border-stone-100 last:border-0 hover:bg-stone-50 transition-colors">
            <div className="flex items-center gap-4 w-1/3">
              <input 
                type="checkbox" 
                checked={h.active}
                onChange={() => handleToggle(i)}
                className="w-5 h-5 accent-[#c6a87c] cursor-pointer"
              />
              <span className={`font-medium text-lg ${h.active ? 'text-[#2c2c2c]' : 'text-stone-400'}`}>{h.name}</span>
            </div>

            {h.active ? (
              <div className="flex items-center gap-4">
                <input 
                  type="time" 
                  value={h.open_time.substring(0, 5)}
                  onChange={(e) => handleChange(i, 'open_time', e.target.value)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-700 focus:ring-2 focus:ring-[#c6a87c]/50 focus:outline-none"
                />
                <span className="text-stone-400">a</span>
                <input 
                  type="time" 
                  value={h.close_time.substring(0, 5)}
                  onChange={(e) => handleChange(i, 'close_time', e.target.value)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-700 focus:ring-2 focus:ring-[#c6a87c]/50 focus:outline-none"
                />
              </div>
            ) : (
              <div className="text-stone-400 font-medium px-4 py-2">Cerrado</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
