import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const PROTECTED_ROUTES = ['/patient', '/doctor', '/hospital'];
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Skip internal Next.js and static asset requests
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request });

  // ── Supabase auth guard ────────────────────────────────────────────────────
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ── Locale cookie ──────────────────────────────────────────────────────────
  if (!request.cookies.has('NEXT_LOCALE')) {
    const acceptLanguage = request.headers.get('accept-language');
    let defaultLocale = 'en';
    if (acceptLanguage) {
      if (acceptLanguage.includes('bn')) defaultLocale = 'bn';
      else if (acceptLanguage.includes('hi')) defaultLocale = 'hi';
      else if (acceptLanguage.includes('te')) defaultLocale = 'te';
    }
    supabaseResponse.cookies.set('NEXT_LOCALE', defaultLocale, { path: '/' });
  }

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r));
  const isAuthPage = AUTH_ROUTES.some(r => pathname.startsWith(r));

  // Redirect unauthenticated users away from protected pages
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Removed the isAuthPage redirect to avoid race conditions with client-side router.push
  // during the login process. The client handles its own redirect.

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
