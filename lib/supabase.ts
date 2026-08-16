import { createClient } from '@supabase/supabase-js';

// No lado do cliente, registrar imediatamente o listener de unhandledrejection
// para capturar erros assíncronos do Supabase GoTrue Auth (Refresh Token Not Found, etc)
// o mais cedo possível na inicialização do app.
if (typeof window !== 'undefined') {
  const handleAuthErrorGlobal = () => {
    console.warn('Limpando sessão local devido a erro crítico de refresh/autenticação.');
    try {
      if (supabaseInstance?.auth) {
        supabaseInstance.auth.signOut({ scope: 'local' }).catch(() => {});
      }

      // Limpar todos os tokens do localStorage do Supabase de forma agressiva
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (!key) continue;
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
      }
      
      // Limpar sessionStorage também
      for (let j = sessionStorage.length - 1; j >= 0; j--) {
        const skey = sessionStorage.key(j);
        if (!skey) continue;
        const lowerKey = skey.toLowerCase();
        if (
          lowerKey.includes('auth-token') || 
          lowerKey.startsWith('sb-') || 
          lowerKey.includes('supabase') || 
          lowerKey.includes('auth') || 
          lowerKey.includes('token')
        ) {
          sessionStorage.removeItem(skey);
        }
      }

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
    const msg = (
      (err?.message || '') + ' ' + 
      (err?.error_description || '') + ' ' + 
      (err?.description || '') + ' ' + 
      (typeof err === 'string' ? err : '') + ' ' + 
      extraMsg
    ).toLowerCase();
    const name = (err?.name || '').toLowerCase();
    
    const hasRefreshTokenKeyword = (
      msg.includes('refresh_token') || 
      msg.includes('refresh token') || 
      msg.includes('gotrue') ||
      msg.includes('invalid refresh') ||
      msg.includes('invalid_grant')
    );
    const hasSessionKeyword = msg.includes('session_not_found') || msg.includes('session not found') || msg.includes('jwt expired');
    const hasAuthApiErrorKeyword = name.includes('authapierror') || name.includes('authretryableerror') || name.includes('autherror') || err?.__isAuthError === true;
    
    return hasRefreshTokenKeyword || hasSessionKeyword || hasAuthApiErrorKeyword;
  };

  const handleRejection = (event: PromiseRejectionEvent) => {
    try {
      const err = event.reason;
      if (isAuthError(err)) {
        console.warn('Capturado unhandled rejection de autenticação antecipadamente no Supabase:', err);
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        handleAuthErrorGlobal();
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
        console.warn('Capturado erro global de autenticação antecipadamente no Supabase:', err || msg);
        if (typeof event.preventDefault === 'function') event.preventDefault();
        if (typeof event.stopImmediatePropagation === 'function') event.stopImmediatePropagation();
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
        handleAuthErrorGlobal();
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
