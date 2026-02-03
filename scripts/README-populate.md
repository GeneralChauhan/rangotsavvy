# Populate Test Data Script

This script populates your Supabase database with comprehensive fake/test data for testing purposes.

## ⚠️ IMPORTANT: Service Role Key Required

**This script requires the Supabase Service Role Key** to bypass Row Level Security (RLS) policies. The anon key will not work because RLS blocks insert operations.

## Prerequisites

1. **Get your Supabase Service Role Key** (REQUIRED):

   - Go to your Supabase Dashboard
   - Navigate to: **Settings > API**
   - Copy the **`service_role`** key (NOT the anon key - this is secret!)
   - ⚠️ **Never commit this key to git!**

2. Install `tsx` to run TypeScript files directly:
   ```bash
   pnpm add -D tsx
   # or
   npm install -D tsx
   ```

## Usage

### Option 1: Using environment variable (Recommended)

```bash
# Set the service role key as an environment variable
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"

# Then run the script
pnpm populate:test
```

### Option 2: Inline with the command

```bash
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here" pnpm populate:test
```

### Option 3: Add to .env.local (for local development)

```bash
# Add to .env.local (make sure it's in .gitignore!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Then run:

```bash
pnpm populate:test
```

### Option 4: Using tsx directly

```bash
SUPABASE_SERVICE_ROLE_KEY="your-key" npx tsx scripts/populate-test-data.ts
```

## What it creates

The script will populate your database with:

- **4 Events**: Van Gogh, Monet, Picasso, and Dali exhibitions
- **90+ Event Dates**: Dates spread across the event duration (some marked as unavailable)
- **450+ Time Slots**: 3-5 time slots per available date
- **20+ SKUs**: Various ticket types (Individual, Group, VIP, Student, etc.)
- **2000+ Inventory Entries**: Inventory for each time slot and SKU combination

## Notes

- The script uses `upsert` operations, so running it multiple times won't create duplicates
- Bookings are **not created** by default because they require valid `user_id` from `auth.users`
- If you want to create bookings, you'll need to:
  1. Use the Supabase service role key (which you're already using)
  2. Or create auth users first and modify the script to use their IDs

## Customization

You can modify the script to:

- Change the number of events, dates, or time slots
- Adjust pricing ranges
- Add more SKU types
- Change capacity ranges
- Enable booking creation (with service role key)

## Troubleshooting

### RLS Policy Violations

If you see errors like `"new row violates row-level security policy"`:

- **Solution**: Use the **Service Role Key** instead of the anon key
- The service role key bypasses RLS policies and is required for this script
- Get it from: Supabase Dashboard > Settings > API > service_role key

### Missing credentials error

- Make sure you've set `SUPABASE_SERVICE_ROLE_KEY` environment variable
- Or add it to your `.env.local` file

### Foreign key errors

- Make sure you've run the migration scripts first (001-004 in the scripts folder)
- The script creates data in order: events → dates → time slots → SKUs → inventory

### Permission errors with anon key

- The anon key cannot bypass RLS policies
- You **must** use the service role key for this script
- The service role key is safe to use in scripts (just don't commit it to git!)
