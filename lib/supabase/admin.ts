import { createClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client with service role key for admin operations
 * This bypasses RLS policies and should ONLY be used server-side
 * 
 * Requires SUPABASE_SERVICE_ROLE_KEY environment variable to be set.
 * Get it from: Supabase Dashboard > Settings > API > service_role key
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set")
  }

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. " +
      "Required for admin operations to bypass RLS. " +
      "Get it from: Supabase Dashboard > Settings > API > service_role key. " +
      "Add it to your .env.local file."
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
