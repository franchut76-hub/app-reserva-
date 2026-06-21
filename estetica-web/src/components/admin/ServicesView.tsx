'use client'

import { useState } from 'react'
import { upsertService, deleteService } from '@/actions/admin-services'

export default function ServicesView({ initialServices }: { initialServices: any[] }) {
  const [services, setServices] = useState(initialServices)
  const [loading, setLoading] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleEdit = (s: any) => {
    setEditingService(s)
    setIsModalOpen(true)
  }

  const handleAddNew = () => {
    setEditingService({ name: '', description: '', duration_minutes: 30, price: 0 })
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar este servicio?')) return
    setLoading(true)
    const res = await deleteService(id)
    if (res.success) {
      setServices(prev => prev.filter(s => s.id !== id))
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await upsertService(editingService)
    if (res.success) {
      // Reload page is easiest way to get new IDs, but we can optimistically update
      if (editingService.id) {
        setServices(prev => prev.map(s => s.id === editingService.id ? editingService : s))
      } else {
        // Just reload for new items to get the DB ID
        window.location.reload()
      }
      setIsModalOpen(false)
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Catálogo de Servicios</h1>
          <p className="text-stone-500">Los cambios aquí se reflejan instantáneamente en la web pública.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="px-6 py-3 bg-[#2c2c2c] text-white rounded-xl text-sm uppercase tracking-widest hover:bg-black transition-colors"
        >
          Añadir Servicio
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
            <h3 className="text-xl font-serif text-[#2c2c2c] mb-2">{s.name}</h3>
            <p className="text-stone-500 text-sm mb-4 flex-1 line-clamp-3">{s.description || 'Sin descripción'}</p>
            
            <div className="flex justify-between items-center mb-6">
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-medium uppercase">{s.duration_minutes} min</span>
              <span className="text-xl font-medium text-[#c6a87c]">{s.price}€</span>
            </div>

            <div className="flex gap-3 pt-4 border-t border-stone-100 mt-auto">
              <button 
                onClick={() => handleEdit(s)}
                className="flex-1 py-2 text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors text-sm font-medium"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(s.id)}
                className="flex-1 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 md:p-8 w-full max-w-lg">
            <h2 className="text-2xl font-serif mb-6 text-[#2c2c2c]">{editingService.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Nombre</label>
                <input 
                  required
                  type="text" 
                  value={editingService.name}
                  onChange={e => setEditingService({...editingService, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-1">Descripción</label>
                <textarea 
                  required
                  rows={3}
                  value={editingService.description}
                  onChange={e => setEditingService({...editingService, description: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Duración (min)</label>
                  <input 
                    required
                    type="number" 
                    step="15"
                    value={editingService.duration_minutes}
                    onChange={e => setEditingService({...editingService, duration_minutes: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-600 mb-1">Precio (€)</label>
                  <input 
                    required
                    type="number" 
                    step="0.01"
                    value={editingService.price}
                    onChange={e => setEditingService({...editingService, price: Number(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
                  />
                </div>
              </div>

              <div className="flex gap-4 mt-8 pt-4 border-t border-stone-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#c6a87c] text-white rounded-xl hover:bg-[#b0956b] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
