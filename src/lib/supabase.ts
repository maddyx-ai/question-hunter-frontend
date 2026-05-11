import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_ANON_KEY;

const hasUrl = Boolean(supabaseUrl);
const hasKey = Boolean(supabaseAnonKey);
console.log(`[supabase] env check: SUPABASE_URL=${hasUrl}, SUPABASE_ANON_KEY=${hasKey}`);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables. " +
    "Add them in Vercel Dashboard > Settings > Environment Variables, or in a local .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
