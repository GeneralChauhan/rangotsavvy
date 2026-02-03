-- Enable Row Level Security on all tables
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Events table policies (public read, admin write)
CREATE POLICY "Events are viewable by everyone" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can insert events" ON public.events
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Event dates policies (public read)
CREATE POLICY "Event dates are viewable by everyone" ON public.event_dates
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage event dates" ON public.event_dates
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only authenticated users can update event dates" ON public.event_dates
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Time slots policies (public read)
CREATE POLICY "Time slots are viewable by everyone" ON public.time_slots
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage time slots" ON public.time_slots
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- SKUs policies (public read)
CREATE POLICY "SKUs are viewable by everyone" ON public.skus
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage SKUs" ON public.skus
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Offers policies (public read)
CREATE POLICY "Offers are viewable by everyone" ON public.offers
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage offers" ON public.offers
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Inventory policies (public read)
CREATE POLICY "Inventory is viewable by everyone" ON public.inventory
  FOR SELECT USING (true);

CREATE POLICY "Only authenticated users can manage inventory" ON public.inventory
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only authenticated users can update inventory" ON public.inventory
  FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Bookings policies (users can only see their own)
CREATE POLICY "Users can view their own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id);
