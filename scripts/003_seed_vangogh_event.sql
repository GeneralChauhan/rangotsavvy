-- Insert the Van Gogh expo event
INSERT INTO public.events (name, description, start_date, end_date, venue)
VALUES (
  'Van Gogh – An Immersive Story',
  'The world''s most loved immersive show is on its final tour to Ahmedabad! Step into a breathtaking 360° immersive journey through Vincent van Gogh''s masterpieces. Experienced by over 1 billion people across 90+ countries.',
  '2026-02-01',
  '2026-04-30',
  'Ahmedabad Convention Centre, Ahmedabad'
)
ON CONFLICT DO NOTHING;

-- Get the event ID (in real scenarios, we''d use a variable here)
-- For now, we''ll insert event dates without hardcoding IDs

-- Create sample SKUs for Van Gogh expo
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Individual Ticket', 'Single admission to Van Gogh immersive experience', 1200.00, 'individual', true
FROM public.events WHERE name = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT id, 'Group of 4', 'Bundle of 4 tickets at discounted rate', 4400.00, 'group_4', true
FROM public.events WHERE name = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT id, 'Group of 5', 'Bundle of 5 tickets at discounted rate', 5500.00, 'group_5', true
FROM public.events WHERE name = 'Van Gogh – An Immersive Story'
UNION ALL
SELECT id, 'Family Package', 'Special family bundle (2 adults + 2 children)', 3600.00, 'family', true
FROM public.events WHERE name = 'Van Gogh – An Immersive Story'
ON CONFLICT DO NOTHING;

-- Insert sample event dates
INSERT INTO public.event_dates (event_id, date, is_available)
SELECT id, CURRENT_DATE + (n || ' days')::INTERVAL, true
FROM public.events, generate_series(1, 60) AS gs(n)
WHERE name = 'Van Gogh – An Immersive Story'
ON CONFLICT DO NOTHING;

-- Insert sample time slots for each date
INSERT INTO public.time_slots (event_date_id, start_time, end_time, capacity)
SELECT id, '09:00'::TIME, '11:00'::TIME, 100
FROM public.event_dates
WHERE event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
UNION ALL
SELECT id, '11:30'::TIME, '13:30'::TIME, 100
FROM public.event_dates
WHERE event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
UNION ALL
SELECT id, '14:00'::TIME, '16:00'::TIME, 100
FROM public.event_dates
WHERE event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
UNION ALL
SELECT id, '16:30'::TIME, '18:30'::TIME, 100
FROM public.event_dates
WHERE event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
UNION ALL
SELECT id, '19:00'::TIME, '21:00'::TIME, 100
FROM public.event_dates
WHERE event_id = (SELECT id FROM public.events WHERE name = 'Van Gogh – An Immersive Story' LIMIT 1)
ON CONFLICT DO NOTHING;

-- Insert Tuesday 50% off offer
INSERT INTO public.offers (event_id, sku_id, name, discount_percentage, applicable_days, is_active)
SELECT e.id, s.id, 'Tuesday Special - 50% Off', 50.00, ARRAY['Tuesday'], true
FROM public.events e
JOIN public.skus s ON e.id = s.event_id
WHERE e.name = 'Van Gogh – An Immersive Story' AND s.category = 'individual'
ON CONFLICT DO NOTHING;
