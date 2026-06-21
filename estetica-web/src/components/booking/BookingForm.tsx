'use client'

import { useState } from 'react'
import { format, addDays, startOfToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { getAvailableSlots, createBooking } from '@/actions/booking'

export default function BookingForm({ services }: { services: any[] }) {
  const [step, setStep] = useState(1)
  const [selectedService, setSelectedService] = useState('')
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday())
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Generate next 14 days
  const nextDays = Array.from({ length: 14 }).map((_, i) => addDays(startOfToday(), i))

  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date)
    setSelectedTime('')
    if (selectedService) {
      setLoading(true)
      try {
        const slots = await getAvailableSlots(format(date, 'yyyy-MM-dd'), selectedService)
        setAvailableSlots(slots)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleNextStep = async () => {
    if (step === 1 && selectedService) {
      // Fetch initial slots for today
      setLoading(true)
      const slots = await getAvailableSlots(format(selectedDate, 'yyyy-MM-dd'), selectedService)
      setAvailableSlots(slots)
      setLoading(false)
      setStep(2)
    } else if (step === 2 && selectedTime) {
      setStep(3)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await createBooking({
      serviceId: selectedService,
      date: format(selectedDate, 'yyyy-MM-dd'),
      time: selectedTime,
      ...formData
    })
    setLoading(false)
    if (res.success) {
      setSuccess(true)
    } else {
      alert('Hubo un error al confirmar la reserva: ' + res.error)
    }
  }

  if (success) {
    return (
      <div className="text-center py-20 px-4">
        <h2 className="text-4xl font-serif mb-4 text-[#2c2c2c]">¡Reserva Confirmada!</h2>
        <p className="text-lg text-stone-600 mb-8 max-w-lg mx-auto">
          Gracias por elegirnos. Te hemos enviado un correo electrónico con los detalles de tu cita.
        </p>
        <button 
          onClick={() => window.location.href = '/'}
          className="px-8 py-4 bg-[#2c2c2c] text-[#f7f5f2] rounded-full uppercase tracking-widest text-sm hover:bg-black transition-colors"
        >
          Volver al Inicio
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6 md:p-10 bg-white shadow-xl shadow-stone-200/50 rounded-2xl">
      {/* Steps indicator */}
      <div className="flex items-center justify-between mb-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-serif text-lg transition-colors ${step >= i ? 'bg-[#c6a87c] text-white' : 'bg-stone-100 text-stone-400'}`}>
              {i}
            </div>
            <span className="text-xs tracking-widest uppercase mt-2 text-stone-500 hidden md:block">
              {i === 1 ? 'Servicio' : i === 2 ? 'Fecha y Hora' : 'Tus Datos'}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-serif mb-6 text-[#2c2c2c]">Selecciona un Servicio</h2>
          <div className="grid gap-4">
            {services.map(s => (
              <div 
                key={s.id} 
                onClick={() => setSelectedService(s.id)}
                className={`p-5 rounded-xl border-2 cursor-pointer transition-all ${selectedService === s.id ? 'border-[#c6a87c] bg-orange-50/50' : 'border-stone-100 hover:border-[#c6a87c]/30'}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-serif text-xl">{s.name}</h3>
                    <p className="text-sm text-stone-500">{s.duration_minutes} min</p>
                  </div>
                  <div className="text-xl font-medium">{s.price}€</div>
                </div>
              </div>
            ))}
          </div>
          <button 
            disabled={!selectedService}
            onClick={handleNextStep}
            className="w-full mt-8 px-6 py-4 bg-[#2c2c2c] text-white rounded-xl disabled:opacity-50 uppercase tracking-widest text-sm"
          >
            Siguiente
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-serif mb-6 text-[#2c2c2c]">Selecciona Fecha y Hora</h2>
          
          <div className="mb-8">
            <div className="flex overflow-x-auto pb-4 gap-3 snap-x scrollbar-hide">
              {nextDays.map(date => {
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                const isSunday = date.getDay() === 0
                return (
                  <button
                    key={date.toISOString()}
                    disabled={isSunday}
                    onClick={() => handleDateSelect(date)}
                    className={`flex-shrink-0 snap-center w-20 p-3 rounded-2xl flex flex-col items-center transition-all ${isSunday ? 'opacity-30 cursor-not-allowed' : isSelected ? 'bg-[#2c2c2c] text-white shadow-lg' : 'bg-stone-50 text-stone-600 hover:bg-stone-100'}`}
                  >
                    <span className="text-xs uppercase tracking-wider">{format(date, 'EEE', { locale: es })}</span>
                    <span className="text-2xl font-serif mt-1">{format(date, 'd')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-h-[200px]">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="w-8 h-8 border-4 border-[#c6a87c] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="text-center py-10 text-stone-500">
                No hay huecos disponibles para este día.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableSlots.map(time => (
                  <button
                    key={time}
                    onClick={() => setSelectedTime(time)}
                    className={`py-3 rounded-xl border transition-all ${selectedTime === time ? 'bg-[#c6a87c] text-white border-[#c6a87c]' : 'border-stone-200 text-stone-600 hover:border-[#c6a87c]/50'}`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-8">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-4 border-2 border-stone-200 text-stone-600 rounded-xl uppercase tracking-widest text-sm flex-1"
            >
              Volver
            </button>
            <button 
              disabled={!selectedTime}
              onClick={handleNextStep}
              className="px-6 py-4 bg-[#2c2c2c] text-white rounded-xl disabled:opacity-50 uppercase tracking-widest text-sm flex-1"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-2xl font-serif mb-6 text-[#2c2c2c]">Tus Datos</h2>
          
          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Nombre Completo</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Email</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-600 mb-1">Teléfono</label>
              <input 
                required
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
              />
            </div>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl mb-8">
            <h4 className="text-sm font-semibold text-stone-800 uppercase tracking-wider mb-2">Resumen de la cita</h4>
            <p className="text-stone-600">Servicio: {services.find(s => s.id === selectedService)?.name}</p>
            <p className="text-stone-600">Fecha: {format(selectedDate, 'dd/MM/yyyy')}</p>
            <p className="text-stone-600">Hora: {selectedTime}</p>
          </div>

          <div className="flex gap-4">
            <button 
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-4 border-2 border-stone-200 text-stone-600 rounded-xl uppercase tracking-widest text-sm flex-1"
            >
              Volver
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="px-6 py-4 bg-[#2c2c2c] text-white rounded-xl disabled:opacity-50 uppercase tracking-widest text-sm flex-1 flex justify-center items-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : 'Confirmar'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
