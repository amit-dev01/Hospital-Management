import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { AuthUser, UserRole } from '@/types/auth';

// ── Types ─────────────────────────────────────────────────────────────────────

type ApiHandler = (
  request: NextRequest,
  context: { params: any; authUser: AuthUser },
) => Promise<Response>;

// ── Internal: resolve AuthUser from request cookies ───────────────────────────

async function resolveAuthUser(request: NextRequest): Promise<AuthUser | null> {
  // We need a no-op response to satisfy the cookie interface —
  // mutations are ignored since we only need to read the session here.
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, role, full_name, phone, updated_at')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role as UserRole,
    profile,
    raw: user,
  };
}

// ── withAuth HOC ──────────────────────────────────────────────────────────────

/**
 * Wraps an API route handler with auth + optional role-based access control.
 *
 * Usage:
 *   export const GET = withAuth(handler, ['doctor', 'admin']);
 *   export const POST = withAuth(handler); // any authenticated user
 */
export function withAuth(handler: ApiHandler, allowedRoles?: UserRole[]) {
  return async function (
    request: NextRequest,
    context: { params: any },
  ): Promise<Response> {
    // 1. Resolve user from session
    const authUser = await resolveAuthUser(request);

    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be signed in to access this resource.' },
        { status: 401 },
      );
    }

    // 2. Role check (if allowedRoles is specified)
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(authUser.role)) {
        return NextResponse.json(
          {
            error: 'Forbidden',
            message: `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${authUser.role}.`,
          },
          { status: 403 },
        );
      }
    }

    // 3. Call the actual handler with the resolved user attached
    return handler(request, { ...context, authUser });
  };
}
