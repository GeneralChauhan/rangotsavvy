-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  venue TEXT,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create dates table (available booking dates)
CREATE TABLE IF NOT EXISTS public.event_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_id, date)
);

-- Create time slots table
CREATE TABLE IF NOT EXISTS public.time_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date_id UUID NOT NULL REFERENCES public.event_dates(id) ON DELETE CASCADE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(event_date_id, start_time)
);

-- Create SKU types table (Ticket types with customizable pricing)
CREATE TABLE IF NOT EXISTS public.skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  category TEXT, -- e.g., 'individual', 'group_4', 'group_5'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create offers/discounts table
CREATE TABLE IF NOT EXISTS public.offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  discount_percentage DECIMAL(5, 2), -- e.g., 50.00 for 50%
  discount_amount DECIMAL(10, 2),
  applicable_days TEXT[], -- e.g., ['Tuesday', 'Wednesday']
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id) ON DELETE CASCADE,
  sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
  total_quantity INTEGER NOT NULL,
  available_quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(time_slot_id, sku_id)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  time_slot_id UUID NOT NULL REFERENCES public.time_slots(id),
  sku_id UUID NOT NULL REFERENCES public.skus(id),
  quantity INTEGER NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, confirmed, cancelled
  email TEXT NOT NULL,
  phone_number TEXT,
  visitor_name TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_event_dates_event_id ON public.event_dates(event_id);
CREATE INDEX IF NOT EXISTS idx_time_slots_event_date_id ON public.time_slots(event_date_id);
CREATE INDEX IF NOT EXISTS idx_skus_event_id ON public.skus(event_id);
CREATE INDEX IF NOT EXISTS idx_offers_event_id ON public.offers(event_id);
CREATE INDEX IF NOT EXISTS idx_offers_sku_id ON public.offers(sku_id);
CREATE INDEX IF NOT EXISTS idx_inventory_time_slot_id ON public.inventory(time_slot_id);
CREATE INDEX IF NOT EXISTS idx_inventory_sku_id ON public.inventory(sku_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_time_slot_id ON public.bookings(time_slot_id);
