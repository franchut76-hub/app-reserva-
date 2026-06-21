-- 1. Creando tablas...
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- 2. Habilitando RLS...
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Creando políticas RLS...
DROP POLICY IF EXISTS "Public can read services" ON public.services;
DROP POLICY IF EXISTS "Public can read business_hours" ON public.business_hours;
DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
DROP POLICY IF EXISTS "Owner can manage appointments" ON public.appointments;

CREATE POLICY "Public can read services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public can read business_hours" ON public.business_hours FOR SELECT USING (true);
CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "Owner can manage appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');

-- 4. Sembrando datos iniciales...
TRUNCATE TABLE public.appointments CASCADE;
TRUNCATE TABLE public.services CASCADE;
TRUNCATE TABLE public.business_hours CASCADE;

INSERT INTO public.services (id, name, duration_minutes, price) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Corte Femenino Premium', 60, 60),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Corte Masculino', 30, 30),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Coloración Balayage', 120, 150),
  ('d0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Tratamiento de Queratina', 90, 120);

INSERT INTO public.business_hours (day_of_week, open_time, close_time) VALUES
  (1, '10:00:00', '20:00:00'),
  (2, '10:00:00', '20:00:00'),
  (3, '10:00:00', '20:00:00'),
  (4, '10:00:00', '20:00:00'),
  (5, '10:00:00', '20:00:00'),
  (6, '10:00:00', '20:00:00');

-- Citas de prueba para hoy
INSERT INTO public.appointments (service_id, date, start_time, client_name, client_email) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', CURRENT_DATE, '11:00:00', 'Ana Pérez', 'ana@example.com'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', CURRENT_DATE, '12:00:00', 'María López', 'maria@example.com'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', CURRENT_DATE + INTERVAL '1 day', '10:00:00', 'Carlos Gómez', 'carlos@example.com');
