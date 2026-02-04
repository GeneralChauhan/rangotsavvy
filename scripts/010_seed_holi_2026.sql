-- Seed data for Rangotsav – 4th March, 2026 (single-day event)
-- One event, one event_date, one time_slot, three SKUs (Early Bird phase)

-- Insert the Holi 2026 event (schema uses title; add name if your schema has it)
INSERT INTO public.events (title, description, venue, start_date, end_date)
VALUES (
  'Rangotsav – 4th March, 2026',
  'Premium, ticketed Holi experience. 1 Complementary (drink + Snacks), DJ, Band, Dhol, Organic Colours, Rain Dance, Food Stalls.',
  'White Feather, Electronic City, Bangalore',
  '2026-03-14',
  '2026-03-14'
);

-- Insert single event date (4th March, 2026 – Holi in 2026 is March 14)
INSERT INTO public.event_dates (event_id, date, is_available)
SELECT id, '2026-03-14'::DATE, true
FROM public.events
WHERE title = 'Rangotsav – 4th March, 2026'
LIMIT 1
ON CONFLICT (event_id, date) DO UPDATE SET is_available = true;

-- Insert one time slot for that date (all-day style slot)
INSERT INTO public.time_slots (event_date_id, start_time, end_time, max_capacity)
SELECT ed.id, '10:00'::TIME, '18:00'::TIME, 500
FROM public.event_dates ed
JOIN public.events e ON e.id = ed.event_id
WHERE e.title = 'Rangotsav – 4th March, 2026' AND ed.date = '2026-03-14'
LIMIT 1
ON CONFLICT (event_date_id, start_time) DO NOTHING;

-- Insert SKUs: Early Bird – Stag ₹1499, Couple ₹2599, Kid (3–7) ₹399
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Stag Entry', 'Early Bird – Single entry', 1499.00, 'stag', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Couple Entry', 'Early Bird – Couple entry', 2599.00, 'couple', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Kid (3–7 years)', 'Early Bird – Age 3 to 7. Above 7 years full ticket applies.', 399.00, 'kid', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;

-- Insert inventory for the single time slot and each SKU (generous capacity)
INSERT INTO public.inventory (time_slot_id, sku_id, total_quantity, available_quantity)
SELECT ts.id, s.id, 200, 200
FROM public.time_slots ts
JOIN public.event_dates ed ON ed.id = ts.event_date_id
JOIN public.events e ON e.id = ed.event_id
CROSS JOIN public.skus s
WHERE e.title = 'Rangotsav – 4th March, 2026' AND s.event_id = e.id
ON CONFLICT (time_slot_id, sku_id) DO NOTHING;
