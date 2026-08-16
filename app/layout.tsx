import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "REALIZZE - Gestão de Contratos",
  description: "Sistema profissional de gestão de contratos e fluxo de caixa.",
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" fill="%23dbeafe"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          id="auth-error-interceptor"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function isAuthError(err, extraMsg) {
                  if (!err && !extraMsg) return false;
                  var msg = ((err && err.message) || '' + ' ' + ((err && err.error_description) || '') + ' ' + ((err && err.description) || '') + ' ' + (typeof err === 'string' ? err : '') + ' ' + (extraMsg || '')).toLowerCase();
                  var name = ((err && err.name) || '').toLowerCase();
                  return (
                    msg.includes('refresh token') ||
                    msg.includes('refresh_token') ||
                    msg.includes('invalid_grant') ||
                    msg.includes('session_not_found') ||
                    msg.includes('session not found') ||
                    msg.includes('jwt expired') ||
                    msg.includes('invalid refresh') ||
                    name.includes('authapierror')
                  );
                }

                function clearTokens() {
                  try {
                    for (var i = localStorage.length - 1; i >= 0; i--) {
                      var key = localStorage.key(i);
                      if (key && (key.includes('supabase') || key.includes('auth') || key.includes('token') || key.startsWith('sb-'))) {
                        localStorage.removeItem(key);
                      }
                    }
                    for (var j = sessionStorage.length - 1; j >= 0; j--) {
                      var skey = sessionStorage.key(j);
                      if (skey && (skey.includes('supabase') || skey.includes('auth') || skey.includes('token') || skey.startsWith('sb-'))) {
                        sessionStorage.removeItem(skey);
                      }
                    }
                    document.cookie.split(";").forEach(function(c) {
                      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });
                  } catch(e) {}
                }

                window.addEventListener('unhandledrejection', function(event) {
                  if (event && isAuthError(event.reason)) {
                    console.warn('[GlobalAuthGuard] Interceptado erro de refresh token/sessão:', event.reason);
                    if (event.preventDefault) event.preventDefault();
                    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                    clearTokens();
                  }
                }, true);

                window.addEventListener('error', function(event) {
                  if (event && isAuthError(event.error, event.message)) {
                    console.warn('[GlobalAuthGuard] Interceptado erro de auth:', event.message);
                    if (event.preventDefault) event.preventDefault();
                    if (event.stopImmediatePropagation) event.stopImmediatePropagation();
                    clearTokens();
                  }
                }, true);
              })();
            `,
          }}
        />
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-CDDHS8E03G"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-CDDHS8E03G');
            `,
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
