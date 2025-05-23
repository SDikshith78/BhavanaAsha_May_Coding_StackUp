// src/supabase.js
import { createClient } from "@supabase/supabase-js";

// Get these from Supabase Dashboard > Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL; // e.g., https://your-project-id.supabase.co
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


