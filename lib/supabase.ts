import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

export const getSupabase = () => {
  if (!supabaseInstance) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Supabase não configurado corretamente.");
      return null;
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Mantemos o padrão para compatibilidade se possível, 
// mas recomendado usar getSupabase() onde possível.
export const supabase = getSupabase() || {
  from: () => { throw new Error("Supabase não configurado"); },
  auth: { getSession: () => ({ data: { session: null } }) }
};
