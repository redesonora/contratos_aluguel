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
  from: () => ({
    select: () => ({
      or: () => ({ order: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
      order: () => ({ limit: () => Promise.resolve({ data: [], error: null }), eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      eq: () => ({ order: () => Promise.resolve({ data: [], error: null }), maybeSingle: () => Promise.resolve({ data: null, error: null }) })
    }),
    insert: () => Promise.resolve({ data: null, error: null }),
    update: () => ({ eq: () => Promise.resolve({ data: null, error: null }) }),
    upsert: () => Promise.resolve({ data: null, error: null }),
    delete: () => ({ eq: () => Promise.resolve({ data: null, error: null }) })
  }),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signOut: () => Promise.resolve({ error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null }, error: null }),
    updateUser: () => Promise.resolve({ data: { user: null }, error: null })
  },
  storage: {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: () => ({ data: { publicUrl: '' } })
    })
  }
};
