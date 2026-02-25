import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://orxjqvpjseuormxpipbl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9yeGpxdnBqc2V1b3JteHBpcGJsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzY2NTMsImV4cCI6MjA4NzAxMjY1M30.bemSfgOgJULnueuGaYiCK1cbkR3nNdI2KqFkX8SeWuc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);