# New Supabase project setup (same schema)

Use this to create a **new** Supabase project with the same schema and Holi 2026 seed data.

## 1. Create the project in Supabase

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Pick organization, name, database password, and region. Create the project.
4. Wait until the project is ready.

## 2. Run the setup SQL

1. In the Supabase dashboard, open **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open `scripts/supabase-full-setup.sql` from this repo and copy its full contents.
4. Paste into the SQL Editor and click **Run** (or Cmd/Ctrl+Enter).
5. Confirm there are no errors. The script will:
   - Create tables: `events`, `event_dates`, `time_slots`, `skus`, `inventory`, `bookings`, `coupons`
   - Add QR code and coupon-related columns on `bookings`
   - Seed **Rangotsav – 4th Holi 2026** (one event, one date, one time slot, 3 SKUs, inventory)

## 3. Connect the app

1. In Supabase: **Project Settings** → **API**.
2. Copy **Project URL** and **anon public** key.
3. In this repo, set (or create) `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Restart the Next.js dev server (`pnpm dev`).

## 4. (Optional) Row Level Security

The script leaves RLS **disabled** so the app can read/write without auth. If you enable Supabase Auth later, uncomment the “Row Level Security” block at the bottom of `supabase-full-setup.sql` and run it in a new query so policies allow the needed access.

## Tables created

| Table         | Purpose                                      |
|---------------|----------------------------------------------|
| `events`      | Event metadata (title, venue, dates)         |
| `event_dates` | One row per event date                       |
| `time_slots`  | Slots per date (start/end time, capacity)    |
| `skus`        | Ticket types and prices per event            |
| `inventory`   | Per-slot, per-SKU available quantity         |
| `bookings`    | Customer bookings (visitor_email, etc.)      |
| `coupons`     | Discount codes (optional)                   |

The app expects `bookings.visitor_email` (and related columns). The insert in the app uses `visitor_email` to match this schema.
