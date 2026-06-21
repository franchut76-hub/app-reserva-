-- 1. Añadir descripción a los servicios si no existe
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;

-- Actualizar los servicios con una descripción
UPDATE public.services SET description = 'Diseño personalizado que realza tu estructura facial y personalidad.' WHERE name = 'Corte Femenino Premium';
UPDATE public.services SET description = 'Corte a tijera o máquina con asesoramiento de estilo y lavado.' WHERE name = 'Corte Masculino';
UPDATE public.services SET description = 'Balayage, mechas y tintes con productos que cuidan la integridad de tu cabello.' WHERE name = 'Coloración Balayage';
UPDATE public.services SET description = 'Hidratación profunda, queratina y protocolos de reparación extrema.' WHERE name = 'Tratamiento de Queratina';

-- Eliminar citas previas para sembrar limpio
TRUNCATE TABLE public.appointments CASCADE;

-- Crear una función para generar citas aleatorias (para poblar el dashboard)
DO $$
DECLARE
  service_ids UUID[];
  client_names TEXT[] := ARRAY['Ana Pérez', 'María López', 'Carlos Gómez', 'Laura Martín', 'Elena Ruiz', 'David Sánchez', 'Lucía Blanco', 'Javier Fernández', 'Carmen Moreno', 'Jorge Alonso'];
  client_emails TEXT[] := ARRAY['ana@example.com', 'maria@example.com', 'carlos@example.com', 'laura@example.com', 'elena@example.com', 'david@example.com', 'lucia@example.com', 'javier@example.com', 'carmen@example.com', 'jorge@example.com'];
  client_phones TEXT[] := ARRAY['600111222', '600333444', '600555666', '600777888', '600999000', '611222333', '611444555', '611666777', '611888999', '622000111'];
  statuses TEXT[] := ARRAY['completed', 'completed', 'completed', 'completed', 'completed', 'confirmed', 'pending', 'cancelled', 'no_show'];
  
  i INT;
  random_service_idx INT;
  random_client_idx INT;
  random_status_idx INT;
  random_days_offset INT;
  random_hour INT;
  
  target_date DATE;
  target_time TIME;
BEGIN
  -- Obtener IDs de servicios
  SELECT array_agg(id) INTO service_ids FROM public.services;

  -- Generar 150 citas distribuidas entre hace 30 días y dentro de 15 días
  FOR i IN 1..150 LOOP
    random_service_idx := floor(random() * array_length(service_ids, 1) + 1);
    random_client_idx := floor(random() * array_length(client_names, 1) + 1);
    
    -- Días de diferencia: de -30 a +15
    random_days_offset := floor(random() * 45) - 30;
    target_date := CURRENT_DATE + (random_days_offset || ' days')::interval;
    
    -- Solo programar de lunes a sabado (extract dow: 0=Dom, 6=Sab)
    IF extract(dow from target_date) = 0 THEN
      target_date := target_date + interval '1 day';
    END IF;

    -- Hora aleatoria entre las 10:00 y las 19:00
    random_hour := floor(random() * 10) + 10;
    target_time := (random_hour || ':00:00')::time;

    -- Si la fecha es pasada, el estado suele ser completado. Si es futura, confirmado/pendiente
    IF target_date < CURRENT_DATE THEN
      -- Mayormente completado o no_show/cancelado
      random_status_idx := floor(random() * 9 + 1); -- De 1 a 9
    ELSE
      -- Futuro: pending, confirmed
      random_status_idx := floor(random() * 2 + 6); -- status index 6 y 7 (confirmed, pending)
    END IF;

    INSERT INTO public.appointments (
      service_id, 
      date, 
      start_time, 
      client_name, 
      client_email, 
      client_phone, 
      status, 
      created_at
    ) VALUES (
      service_ids[random_service_idx],
      target_date,
      target_time,
      client_names[random_client_idx],
      client_emails[random_client_idx],
      client_phones[random_client_idx],
      statuses[random_status_idx],
      target_date - interval '3 days' -- Creado unos días antes
    );
  END LOOP;
END $$;
