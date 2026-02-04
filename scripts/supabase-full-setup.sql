-- =============================================================================
-- Rangotsav / Holi 2026 – Full Supabase setup for a NEW project
-- Run this entire file in Supabase SQL Editor (Project Settings → SQL Editor → New query)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. CORE SCHEMA (events, event_dates, time_slots, skus, inventory, bookings)
-- -----------------------------------------------------------------------------

DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.skus CASCADE;
DROP TABLE IF EXISTS public.time_slots CASCADE;
DROP TABLE IF EXISTS public.event_dates CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  venue TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_id, date)
);

CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date_id UUID NOT NULL REFERENCES public.event_dates(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_date_id, start_time)
);

CREATE TABLE public.skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  total_quantity INTEGER NOT NULL DEFAULT 0,
  available_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(time_slot_id, sku_id)
);

CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  sku_id UUID NOT NULL REFERENCES public.skus(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending',
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_event_dates_event_id ON public.event_dates(event_id);
CREATE INDEX idx_time_slots_event_date_id ON public.time_slots(event_date_id);
CREATE INDEX idx_skus_event_id ON public.skus(event_id);
CREATE INDEX idx_inventory_time_slot_id ON public.inventory(time_slot_id);
CREATE INDEX idx_inventory_sku_id ON public.inventory(sku_id);
CREATE INDEX idx_bookings_time_slot_id ON public.bookings(time_slot_id);
CREATE INDEX idx_bookings_sku_id ON public.bookings(sku_id);
CREATE INDEX idx_bookings_email ON public.bookings(visitor_email);

-- -----------------------------------------------------------------------------
-- 2. BOOKINGS: QR code + coupon columns
-- -----------------------------------------------------------------------------

ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS qr_code TEXT,
  ADD COLUMN IF NOT EXISTS coupon_code TEXT,
  ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);

COMMENT ON COLUMN public.bookings.qr_code IS 'Base64 encoded QR code data URL';

-- -----------------------------------------------------------------------------
-- 3. COUPONS TABLE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  min_order_amount DECIMAL(10, 2),
  max_discount DECIMAL(10, 2),
  usage_limit INTEGER,
  used_count INTEGER NOT NULL DEFAULT 0,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_event_id ON public.coupons(event_id);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON public.coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_bookings_coupon_code ON public.bookings(coupon_code);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_coupons_updated_at ON public.coupons;
CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON public.coupons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -----------------------------------------------------------------------------
-- 4. SEED: Rangotsav – 4th March, 2026 (one event, one date, one slot, 3 SKUs)
-- -----------------------------------------------------------------------------

INSERT INTO public.events (title, description, venue, start_date, end_date)
VALUES (
  'Rangotsav – 4th March, 2026',
  'Premium, ticketed Holi experience. 1 Complementary (drink + Snacks), DJ, Band, Dhol, Organic Colours, Rain Dance, Food Stalls.',
  'Palladium Mall, Ahmedabad',
  '2026-03-14',
  '2026-03-14'
);

INSERT INTO public.event_dates (event_id, date, is_available)
SELECT id, '2026-03-14'::DATE, true
FROM public.events
WHERE title = 'Rangotsav – 4th March, 2026'
LIMIT 1
ON CONFLICT (event_id, date) DO UPDATE SET is_available = true;

INSERT INTO public.time_slots (event_date_id, start_time, end_time, max_capacity)
SELECT ed.id, '10:00'::TIME, '18:00'::TIME, 500
FROM public.event_dates ed
JOIN public.events e ON e.id = ed.event_id
WHERE e.title = 'Rangotsav – 4th March, 2026' AND ed.date = '2026-03-14'
LIMIT 1
ON CONFLICT (event_date_id, start_time) DO NOTHING;

INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Stag Entry', 'Early Bird – Single entry', 1499.00, 'stag', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Couple Entry', 'Early Bird – Couple entry', 2599.00, 'couple', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;
INSERT INTO public.skus (event_id, name, description, base_price, category, is_active)
SELECT id, 'Kid (3–7 years)', 'Early Bird – Age 3 to 7. Above 7 years full ticket applies.', 399.00, 'kid', true FROM public.events WHERE title = 'Rangotsav – 4th March, 2026' LIMIT 1;

INSERT INTO public.inventory (time_slot_id, sku_id, total_quantity, available_quantity)
SELECT ts.id, s.id, 200, 200
FROM public.time_slots ts
JOIN public.event_dates ed ON ed.id = ts.event_date_id
JOIN public.events e ON e.id = ed.event_id
CROSS JOIN public.skus s
WHERE e.title = 'Rangotsav – 4th March, 2026' AND s.event_id = e.id
ON CONFLICT (time_slot_id, sku_id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (optional – enable if you use Supabase Auth)
-- Uncomment the block below to enable RLS and allow public read + insert/update
-- for anonymous booking flow.
-- -----------------------------------------------------------------------------

-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.event_dates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- CREATE POLICY "Public read events" ON public.events FOR SELECT USING (true);
-- CREATE POLICY "Public read event_dates" ON public.event_dates FOR SELECT USING (true);
-- CREATE POLICY "Public read time_slots" ON public.time_slots FOR SELECT USING (true);
-- CREATE POLICY "Public read skus" ON public.skus FOR SELECT USING (true);
-- CREATE POLICY "Public read inventory" ON public.inventory FOR SELECT USING (true);
-- CREATE POLICY "Public read bookings" ON public.bookings FOR SELECT USING (true);
-- CREATE POLICY "Public insert bookings" ON public.bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public update bookings" ON public.bookings FOR UPDATE USING (true);
-- CREATE POLICY "Public read coupons" ON public.coupons FOR SELECT USING (true);

-- Done. Point your app .env to this project's SUPABASE_URL and SUPABASE_ANON_KEY.
