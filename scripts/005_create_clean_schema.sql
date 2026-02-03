-- Clean schema for Van Gogh booking system
-- This matches the actual requirements:
-- - One event, one venue
-- - Multiple dates per event
-- - Multiple time slots per date
-- - Different SKUs/tiers per time slot
-- - Max 250 tickets per time slot
-- - One person can buy multiple tickets

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.skus CASCADE;
DROP TABLE IF EXISTS public.time_slots CASCADE;
DROP TABLE IF EXISTS public.event_dates CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- Events table
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

-- Event dates table (multiple dates per event)
CREATE TABLE public.event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_id, date)
);

-- Time slots table (multiple time slots per date)
CREATE TABLE public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date_id UUID NOT NULL REFERENCES public.event_dates(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_capacity INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_date_id, start_time)
);

-- SKUs table (ticket types/tiers - linked to events, can be used across all time slots)
CREATE TABLE public.skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category TEXT, -- e.g., 'individual', 'group_4', 'vip', 'student'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Inventory table (tracks available tickets per time slot and SKU)
-- Max 250 tickets per time slot total (across all SKUs)
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

-- Bookings table (one person can buy multiple tickets)
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  sku_id UUID NOT NULL REFERENCES public.skus(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'cancelled'
  visitor_name TEXT NOT NULL,
  visitor_email TEXT NOT NULL,
  visitor_phone TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_event_dates_event_id ON public.event_dates(event_id);
CREATE INDEX idx_time_slots_event_date_id ON public.time_slots(event_date_id);
CREATE INDEX idx_skus_event_id ON public.skus(event_id);
CREATE INDEX idx_inventory_time_slot_id ON public.inventory(time_slot_id);
CREATE INDEX idx_inventory_sku_id ON public.inventory(sku_id);
CREATE INDEX idx_bookings_time_slot_id ON public.bookings(time_slot_id);
CREATE INDEX idx_bookings_sku_id ON public.bookings(sku_id);
CREATE INDEX idx_bookings_email ON public.bookings(visitor_email);

-- Enable Row Level Security (optional - comment out if you don't want RLS)
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.event_dates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (uncomment if you enabled RLS above)
-- Public read access, admin write access
-- CREATE POLICY "Events are viewable by everyone" ON public.events FOR SELECT USING (true);
-- CREATE POLICY "Event dates are viewable by everyone" ON public.event_dates FOR SELECT USING (true);
-- CREATE POLICY "Time slots are viewable by everyone" ON public.time_slots FOR SELECT USING (true);
-- CREATE POLICY "SKUs are viewable by everyone" ON public.skus FOR SELECT USING (true);
-- CREATE POLICY "Inventory is viewable by everyone" ON public.inventory FOR SELECT USING (true);
-- CREATE POLICY "Bookings are viewable by everyone" ON public.bookings FOR SELECT USING (true);
