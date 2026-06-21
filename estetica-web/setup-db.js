const postgres = require('postgres');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setup() {
  console.log('1. Creando tablas...');
  await sql`
    CREATE TABLE IF NOT EXISTS public.services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      duration_minutes INT NOT NULL,
      price NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.business_hours (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
      open_time TIME NOT NULL,
      close_time TIME NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_id UUID REFERENCES public.services(id) ON DELETE CASCADE,
      date DATE NOT NULL,
      start_time TIME NOT NULL,
      client_name TEXT NOT NULL,
      client_email TEXT NOT NULL,
      client_phone TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `;

  console.log('2. Habilitando RLS...');
  await sql`ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;`;
  await sql`ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;`;
  await sql`ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;`;

  console.log('3. Creando políticas RLS...');
  // Limpiar políticas previas por si existen
  await sql`DROP POLICY IF EXISTS "Public can read services" ON public.services;`;
  await sql`DROP POLICY IF EXISTS "Public can read business_hours" ON public.business_hours;`;
  await sql`DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;`;
  await sql`DROP POLICY IF EXISTS "Owner can manage appointments" ON public.appointments;`;

  // Services: lectura pública
  await sql`CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);`;
  
  // Business hours: lectura pública
  await sql`CREATE POLICY "Public can read business_hours" ON public.business_hours FOR SELECT USING (true);`;
  
  // Appointments: inserción pública, pero lectura/modificación sólo para auth (el dueño)
  await sql`CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);`;
  await sql`CREATE POLICY "Owner can manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');`;

  console.log('4. Sembrando datos iniciales...');
  
  // Limpiar datos
  await sql`TRUNCATE TABLE public.appointments CASCADE;`;
  await sql`TRUNCATE TABLE public.services CASCADE;`;
  await sql`TRUNCATE TABLE public.business_hours CASCADE;`;

  // Servicios
  const services = [
    { name: 'Corte Femenino Premium', duration_minutes: 60, price: 60 },
    { name: 'Corte Masculino', duration_minutes: 30, price: 30 },
    { name: 'Coloración Balayage', duration_minutes: 120, price: 150 },
    { name: 'Tratamiento de Queratina', duration_minutes: 90, price: 120 },
  ];

  const insertedServices = [];
  for (const s of services) {
    const [res] = await sql`
      INSERT INTO public.services (name, duration_minutes, price) 
      VALUES (${s.name}, ${s.duration_minutes}, ${s.price})
      RETURNING id;
    `;
    insertedServices.push(res.id);
  }

  // Horarios de Lunes(1) a Sabado(6), Domingo(0) cerrado.
  for (let d = 1; d <= 6; d++) {
    await sql`
      INSERT INTO public.business_hours (day_of_week, open_time, close_time)
      VALUES (${d}, '10:00:00', '20:00:00');
    `;
  }

  // Citas de prueba (para hoy y mañana)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (d) => d.toISOString().split('T')[0];

  const appointments = [
    { service_id: insertedServices[0], date: formatDate(today), start_time: '11:00:00', client_name: 'Ana Pérez', client_email: 'ana@example.com' },
    { service_id: insertedServices[2], date: formatDate(today), start_time: '12:00:00', client_name: 'María López', client_email: 'maria@example.com' },
    { service_id: insertedServices[1], date: formatDate(tomorrow), start_time: '10:00:00', client_name: 'Carlos Gómez', client_email: 'carlos@example.com' },
  ];

  for (const a of appointments) {
    await sql`
      INSERT INTO public.appointments (service_id, date, start_time, client_name, client_email)
      VALUES (${a.service_id}, ${a.date}, ${a.start_time}, ${a.client_name}, ${a.client_email});
    `;
  }

  console.log('5. Creando cuenta de dueño en Auth...');
  const ownerEmail = 'admin@esteticaweb.com';
  const ownerPassword = 'AdminPassword2026!';
  
  const { data: users, error: listError } = await supabase.auth.admin.listUsers();
  const existingUser = users?.users.find(u => u.email === ownerEmail);
  
  if (!existingUser) {
    const { error: createError } = await supabase.auth.admin.createUser({
      email: ownerEmail,
      password: ownerPassword,
      email_confirm: true
    });
    if (createError) {
      console.error('Error creando usuario:', createError.message);
    } else {
      console.log('Usuario creado exitosamente.');
    }
  } else {
    console.log('El usuario dueño ya existe.');
  }

  console.log('\n--- SETUP COMPLETADO ---');
  console.log('Email Admin:', ownerEmail);
  console.log('Password Admin:', ownerPassword);

  process.exit(0);
}

setup().catch(err => {
  console.error('Error de setup:', err);
  process.exit(1);
});
