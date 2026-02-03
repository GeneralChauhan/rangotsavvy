-- Seed data for the clean schema
-- Creates one Van Gogh event with sample data

-- Insert the Van Gogh event
INSERT INTO public.events (title, description, venue, start_date, end_date)
VALUES (
  'Van Gogh – An Immersive Story',
  'The world''s most loved immersive show is on its final tour to Ahmedabad! Step into a breathtaking 360° immersive journey through Vincent van Gogh''s masterpieces. Experienced by over 1 billion people across 90+ countries.',
  'Ahmedabad Convention Centre, Ahmedabad',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '60 days'
)
RETURNING id;

-- Get the event ID (you'll need to replace this with the actual ID or use a variable)
-- For now, we'll use a subquery

-- Insert event dates (next 30 days)
INSERT INTO public.event_dates (event_id, date, is_available)
SELECT 
  e.id,
  CURRENT_DATE + (gs.n || ' days')::INTERVAL,
  true
FROM public.events e
CROSS JOIN generate_series(1, 30) AS gs(n)
WHERE e.title = 'Van Gogh – An Immersive Story'
ON CONFLICT DO NOTHING;

-- Insert time slots for each date (5 slots per day)
INSERT INTO public.time_slots (event_date_id, start_time, end_time, max_capacity)
SELECT 
  ed.id,
  times.start_time,
  times.end_time,
  250
FROM public.event_dates ed
CROSS JOIN (
  VALUES 
    ('09:00'::TIME, '11:00'::TIME),
    ('11:30'::TIME, '13:30'::TIME),
    ('14:00'::TIME, '16:00'::TIME),
    ('16:30'::TIME, '18:30'::TIME),
    ('19:00'::TIME, '21:00'::TIME)
) AS times(start_time, end_time)
WHERE ed.event_id = (SELECT id FROM public.events WHERE title = 'Van Gogh – An Immersive Story' LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert SKUs (ticket types)
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT 
  id,
  'Individual Ticket',
  'Single admission to Van Gogh immersive experience',
  1200.00,
  'individual',
  true
FROM public.events WHERE title = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT 
  id,
  'Group of 4',
  'Bundle of 4 tickets at discounted rate',
  4400.00,
  'group_4',
  true
FROM public.events WHERE title = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT 
  id,
  'Group of 5',
  'Bundle of 5 tickets at discounted rate',
  5500.00,
  'group_5',
  true
FROM public.events WHERE title = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT 
  id,
  'VIP Experience',
  'Premium experience with priority access',
  2500.00,
  'vip',
  true
FROM public.events WHERE title = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT 
  id,
  'Student Discount',
  'Discounted ticket for students',
  800.00,
  'student',
  true
FROM public.events WHERE title = 'Van Gogh – An Immersive Story'
ON CONFLICT DO NOTHING;

-- Insert inventory for all time slots and SKUs
-- Distribute 250 tickets across SKUs (e.g., 100 individual, 50 group_4, 50 group_5, 30 vip, 20 student)
INSERT INTO public.inventory (time_slot_id, sku_id, total_quantity, available_quantity)
SELECT 
  ts.id,
  s.id,
  CASE s.category
    WHEN 'individual' THEN 100
    WHEN 'group_4' THEN 50
    WHEN 'group_5' THEN 50
    WHEN 'vip' THEN 30
    WHEN 'student' THEN 20
    ELSE 50
  END,
  CASE s.category
    WHEN 'individual' THEN 100
    WHEN 'group_4' THEN 50
    WHEN 'group_5' THEN 50
    WHEN 'vip' THEN 30
    WHEN 'student' THEN 20
    ELSE 50
  END
FROM public.time_slots ts
CROSS JOIN public.skus s
WHERE s.event_id = (SELECT id FROM public.events WHERE title = 'Van Gogh – An Immersive Story' LIMIT 1)
ON CONFLICT DO NOTHING;
