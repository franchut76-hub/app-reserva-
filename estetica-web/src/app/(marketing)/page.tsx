import Hero from "@/components/hero/Hero";
import Services from "@/components/sections/Services";
import About from "@/components/sections/About";
import Gallery from "@/components/sections/Gallery";
import CTA from "@/components/sections/CTA";
import { getServicesAdmin } from "@/actions/admin-services"; // We can reuse this or the booking one

export const dynamic = 'force-dynamic'

export default async function Home() {
  // Let's use the public one if we want, or just the admin one which fetches all
  // Actually, booking has getServices()
  const { getServices } = await import('@/actions/booking')
  const services = await getServices()

  return (
    <main className="min-h-screen bg-brand-nude">
      <Hero />
      <Services services={services || []} />
      <About />
      <Gallery />
      <CTA />
    </main>
  );
}
