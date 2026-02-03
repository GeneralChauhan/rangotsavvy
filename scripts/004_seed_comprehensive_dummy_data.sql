-- Clear existing data for fresh start (optional - comment out if you want to keep data)
-- DELETE FROM public.inventory;
-- DELETE FROM public.bookings;
-- DELETE FROM public.offers;
-- DELETE FROM public.time_slots;
-- DELETE FROM public.event_dates;
-- DELETE FROM public.skus;
-- DELETE FROM public.events;

-- Get or create the Van Gogh event
WITH event_data AS (
  INSERT INTO public.events (name, description, start_date, end_date, venue)
  VALUES (
    'Van Gogh – An Immersive Story',
    'The world''s most loved immersive show is on its final tour to Ahmedabad! Step into a breathtaking 360° immersive journey through Vincent van Gogh''s masterpieces. Experienced by over 1 billion people across 90+ countries.',
    '2026-02-01',
    '2026-04-30',
    'Ahmedabad Convention Centre, Ahmedabad'
  )
  ON CONFLICT (name) DO UPDATE SET updated_at = now()
  RETURNING id
)

-- Insert or update SKUs
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT 
  (SELECT id FROM event_data),
  'Individual Ticket',
  'Single admission to Van Gogh immersive experience',
  1200.00,
  'individual',
  true
UNION ALL
SELECT 
  (SELECT id FROM event_data),
  'Group of 4',
  'Bundle of 4 tickets at discounted rate',
  4400.00,
  'group_4',
  true
UNION ALL
SELECT 
  (SELECT id FROM event_data),
  'Group of 5',
  'Bundle of 5 tickets at discounted rate',
  5500.00,
  'group_5',
  true
UNION ALL
SELECT 
  (SELECT id FROM event_data),
  'Family Package',
  'Special family bundle (2 adults + 2 children)',
  3600.00,
  'family',
  true
ON CONFLICT DO NOTHING;

-- Insert event dates (next 60 days)
INSERT INTO public.event_dates (event_id, date, is_available)
SELECT 
  e.id,
  CURRENT_DATE + (gs.n || ' days')::INTERVAL,
  true
FROM (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1) e,
     generate_series(1, 60) AS gs(n)
ON CONFLICT DO NOTHING;

-- Insert time slots for each date (9 AM to 9 PM, 5 slots per day)
INSERT INTO public.time_slots (event_date_id, start_time, end_time, capacity)
SELECT 
  ed.id,
  times.start_time,
  times.end_time,
  100
FROM public.event_dates ed
CROSS JOIN (
  VALUES 
    ('09:00'::TIME, '11:00'::TIME),
    ('11:30'::TIME, '13:30'::TIME),
    ('14:00'::TIME, '16:00'::TIME),
    ('16:30'::TIME, '18:30'::TIME),
    ('19:00'::TIME, '21:00'::TIME)
) AS times(start_time, end_time)
ON CONFLICT DO NOTHING;

-- Insert inventory for all time slots and SKUs
INSERT INTO public.inventory (time_slot_id, sku_id, available_quantity)
SELECT 
  ts.id,
  s.id,
  100
FROM public.time_slots ts
CROSS JOIN public.skus s
WHERE s.event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert Tuesday 50% off offer
INSERT INTO public.offers (event_id, name, discount_percentage, applicable_days, is_active)
SELECT 
  id,
  'Tuesday Special - 50% Off Individual Tickets',
  50.00,
  ARRAY['Tuesday'],
  true
FROM public.events 
WHERE name = 'Van Gogh – An Immersive Story'
ON CONFLICT DO NOTHING;
