import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// ── Types ─────────────────────────────────────────────────────────────────────
type UserRole = 'patient' | 'doctor' | 'admin';

interface RoleRouteConfig {
  prefix: string;
  loginPath: string;
  defaultDashboard: string;
}

// ── Per-role route configuration (inlined to avoid Edge import issues) ─────────
const ROLE_ROUTE_CONFIG: Record<UserRole, RoleRouteConfig> = {
  patient: {
    prefix: '/patient',
    loginPath: '/login?role=patient',
    defaultDashboard: '/patient/dashboard',
  },
  doctor: {
    prefix: '/doctor',
    loginPath: '/login?role=doctor',
    defaultDashboard: '/doctor/dashboard',
  },
  admin: {
    prefix: '/hospital',
    loginPath: '/login?role=admin',
    defaultDashboard: '/hospital/dashboard',
  },
};

const ALL_PROTECTED_PREFIXES = Object.values(ROLE_ROUTE_CONFIG).map((c) => c.prefix);

const AUTH_ROUTES = ['/login', '/register'];

// ── Role → protected prefix map (reverse-lookup) ──────────────────────────────
const PREFIX_TO_ROLE: Record<string, UserRole> = {
  '/patient': 'patient',
  '/doctor': 'doctor',
  '/hospital': 'admin',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // ── Build Supabase client with cookie refresh ─────────────────────────────
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Forward cookies to request for downstream use
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Rebuild response so cookies are forwarded to the browser
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // ── IMPORTANT: Always call getUser() to refresh the session ──────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Locale cookie (preserve existing behaviour) ───────────────────────────
  if (!request.cookies.has('NEXT_LOCALE')) {
    const accept = request.headers.get('accept-language') ?? '';
    let locale = 'en';
    if (accept.includes('bn')) locale = 'bn';
    else if (accept.includes('hi')) locale = 'hi';
    else if (accept.includes('te')) locale = 'te';
    supabaseResponse.cookies.set('NEXT_LOCALE', locale, { path: '/' });
  }

  // ── Route classification ──────────────────────────────────────────────────
  const matchedPrefix = ALL_PROTECTED_PREFIXES.find((p) =>
    pathname.startsWith(p),
  );
  const isProtected = !!matchedPrefix;
  const isAuthPage = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  // ── 1. Not authenticated → redirect to relevant login ─────────────────────
  if (isProtected && !user) {
    const role = matchedPrefix ? PREFIX_TO_ROLE[matchedPrefix] : null;
    const loginPath = role
      ? ROLE_ROUTE_CONFIG[role].loginPath
      : '/login';

    const url = request.nextUrl.clone();
    url.pathname = loginPath.split('?')[0];
    url.search = loginPath.includes('?') ? `?${loginPath.split('?')[1]}` : '';
    url.searchParams.set('next', pathname); // preserve destination
    return NextResponse.redirect(url);
  }

  // ── 2. Authenticated — check role access ──────────────────────────────────
  if (isProtected && user && matchedPrefix) {
    const requiredRole = PREFIX_TO_ROLE[matchedPrefix];

    // Fetch role from profiles table
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = (profile?.role ?? 'patient') as UserRole;

    if (userRole !== requiredRole) {
      // Wrong role — send them to their own dashboard
      const correctConfig = ROLE_ROUTE_CONFIG[userRole];
      const url = request.nextUrl.clone();
      url.pathname = correctConfig.defaultDashboard;
      url.search = '';
      return NextResponse.redirect(url);
    }
  }

  // ── 3. Authenticated user on auth page — redirect to their dashboard ───────
  if (isAuthPage && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const userRole = (profile?.role ?? 'patient') as UserRole;
    const config = ROLE_ROUTE_CONFIG[userRole];
    const url = request.nextUrl.clone();
    url.pathname = config.defaultDashboard;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
