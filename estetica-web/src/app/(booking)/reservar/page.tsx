import BookingForm from '@/components/booking/BookingForm'
import { getServices } from '@/actions/booking'

export const metadata = {
  title: 'Reservar Cita | Estética Web',
  description: 'Reserva tu cita en nuestro centro de estética de forma fácil y rápida.',
}

export const dynamic = 'force-dynamic' // To ensure we always fetch latest DB info

export default async function ReservarPage() {
  const services = await getServices()

  return (
    <main className="min-h-screen bg-[#f7f5f2] pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <span className="text-[#c6a87c] uppercase tracking-[0.2em] text-sm font-semibold mb-4 block">Reserva tu momento</span>
        <h1 className="text-5xl md:text-6xl font-serif text-[#2c2c2c] mb-6">Tu Cita a un Clic</h1>
        <p className="text-stone-500 max-w-xl mx-auto text-lg">
          Selecciona el servicio que deseas, elije la fecha y hora que mejor se adapte a ti y confirma tus datos.
        </p>
      </div>

      <BookingForm services={services || []} />
    </main>
  )
}
