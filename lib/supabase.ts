import { createClient } from '@supabase/supabase-js';

// No lado do cliente, registrar imediatamente o listener de unhandledrejection
// para capturar erros assíncronos do Supabase GoTrue Auth (Refresh Token Not Found, etc)
// o mais cedo possível na inicialização do app.
if (typeof window !== 'undefined') {
  const handleAuthErrorGlobal = () => {
    console.warn('Limpando sessão local devido a erro crítico de refresh/autenticação.');
    try {
      // Limpar todos os tokens do localStorage do Supabase
      Object.keys(localStorage).forEach(key => {
        if (key.includes('-auth-token')) {
          localStorage.removeItem(key);
        }
      });
      // Limpar cookies para evitar loops de cookies expirados
      document.cookie.split(";").forEach((c) => { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    } catch (e) {
      console.error('Erro ao limpar dados locais de auth:', e);
    }
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    try {
      const err = event.reason;
      const msg = err?.message?.toLowerCase() || '';
      if (
        msg.includes('refresh token') || 
        msg.includes('not found') || 
        msg.includes('invalid') || 
        msg.includes('expired') ||
        (err?.name === 'AuthApiError' && (err?.status === 400 || err?.status === 401))
      ) {
        console.error('Capturado unhandled rejection de autenticação antecipadamente no Supabase:', err);
        event.preventDefault();
        event.stopPropagation();
        handleAuthErrorGlobal();
        // Recarrega de forma limpa para recriar o cliente sem estado obsoleto
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    } catch (e) {
      // Evitar que erros no próprio interceptador travem a execução
    }
  };

  window.addEventListener('unhandledrejection', handleRejection);
}

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
