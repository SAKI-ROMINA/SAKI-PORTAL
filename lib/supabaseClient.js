import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

console.log("SUPABASE URL runtime:", supabaseUrl);
console.log(
  "SUPABASE PUBLISHABLE KEY present:",
  !!supabasePublishableKey,
  supabasePublishableKey?.slice(0, 20)
);

if (!supabaseUrl || !supabasePublishableKey) {
  console.warn(
    "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});