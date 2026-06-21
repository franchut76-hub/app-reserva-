import { login } from '@/actions/admin'

export const metadata = {
  title: 'Login Admin | Estética Web',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#f7f5f2] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-2xl shadow-xl shadow-stone-200/50">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-[#2c2c2c] mb-2">Acceso Privado</h1>
          <p className="text-stone-500 text-sm tracking-wide">ÁREA DE GESTIÓN</p>
        </div>

        <form action={login} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
              placeholder="admin@esteticaweb.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-2">Contraseña</label>
            <input 
              name="password"
              type="password" 
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#c6a87c]/50"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-4 mt-4 bg-[#2c2c2c] text-white rounded-xl uppercase tracking-widest text-sm hover:bg-black transition-colors"
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  )
}
