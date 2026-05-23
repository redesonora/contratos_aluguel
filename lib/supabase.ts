import { createClient } from '@supabase/supabase-js';

// No lado do cliente, registrar imediatamente o listener de unhandledrejection
// para capturar erros assíncronos do Supabase GoTrue Auth (Refresh Token Not Found, etc)
// o mais cedo possível na inicialização do app.
if (typeof window !== 'undefined') {
  const handleAuthErrorGlobal = () => {
    console.warn('Limpando sessão local devido a erro crítico de refresh/autenticação.');
    try {
      // Limpar todos os tokens do localStorage do Supabase de forma agressiva
      Object.keys(localStorage).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('auth-token') || 
          lowerKey.startsWith('sb-') || 
          lowerKey.includes('supabase') || 
          lowerKey.includes('auth') || 
          lowerKey.includes('token')
        ) {
          localStorage.removeItem(key);
        }
      });
      
      // Limpar sessionStorage também
      Object.keys(sessionStorage).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (
          lowerKey.includes('auth-token') || 
          lowerKey.startsWith('sb-') || 
          lowerKey.includes('supabase') || 
          lowerKey.includes('auth') || 
          lowerKey.includes('token')
        ) {
          sessionStorage.removeItem(key);
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

  const isAuthError = (err: any, extraMsg: string = '') => {
    if (!err && !extraMsg) return false;
    const msg = ((err?.message || '') + ' ' + (err?.error_description || '') + ' ' + (err?.description || '') + ' ' + extraMsg).toLowerCase();
    const name = (err?.name || '').toLowerCase();
    
    const hasRefreshTokenKeyword = msg.includes('refresh_token') || msg.includes('refresh token') || msg.includes('gotrue');
    const hasSessionKeyword = msg.includes('session_not_found') || msg.includes('session not found');
    const hasAuthApiErrorKeyword = name.includes('authapierror') || name.includes('authretryableerror') || name.includes('autherror') || err?.__isAuthError === true;
    
    // Devem possuir termos específicos de auth combinados com falha/expiração/ausência do token
    const isCriticalAuthError = (hasRefreshTokenKeyword || hasSessionKeyword) && (
      msg.includes('not found') || 
      msg.includes('invalid') || 
      msg.includes('expired') || 
      msg.includes('revoked') || 
      msg.includes('inactive') ||
      msg.includes('fail')
    );
    
    return isCriticalAuthError || hasAuthApiErrorKeyword;
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    try {
      const err = event.reason;
      if (isAuthError(err)) {
        console.error('Capturado unhandled rejection de autenticação antecipadamente no Supabase:', err);
        event.preventDefault();
        event.stopPropagation();
        handleAuthErrorGlobal();
        
        // Evita loop de reload infinito
        const lastReload = sessionStorage.getItem('last_global_auth_reload');
        const now = Date.now();
        if (!lastReload || (now - parseInt(lastReload)) > 6000) {
          sessionStorage.setItem('last_global_auth_reload', now.toString());
          setTimeout(() => {
            window.location.reload();
          }, 150);
        } else {
          console.warn('Prevenido loop de reload global de auth.');
        }
      }
    } catch (e) {
      // Evitar que erros no próprio interceptador travem a execução
    }
  };

  const handleError = (event: ErrorEvent) => {
    try {
      const err = event.error;
      const msg = (event.message || '').toLowerCase();
      if (isAuthError(err, msg)) {
        console.error('Capturado erro global de autenticação antecipadamente no Supabase:', err);
        event.preventDefault();
        event.stopPropagation();
        handleAuthErrorGlobal();

        const lastReload = sessionStorage.getItem('last_global_auth_reload');
        const now = Date.now();
        if (!lastReload || (now - parseInt(lastReload)) > 6000) {
          sessionStorage.setItem('last_global_auth_reload', now.toString());
          setTimeout(() => {
            window.location.reload();
          }, 150);
        } else {
          console.warn('Prevenido loop de reload global de auth.');
        }
      }
    } catch (e) {}
  };

  window.addEventListener('unhandledrejection', handleRejection, true);
  window.addEventListener('error', handleError, true);
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
