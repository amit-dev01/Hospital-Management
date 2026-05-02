'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { ROLE_ROUTE_CONFIG, type AuthUser, type UserRole } from '@/types/auth';

// ── Context ───────────────────────────────────────────────────────────────────

interface AuthContextValue {
  authUser: AuthUser | null;
  /** Same as authUser?.role — convenience shorthand */
  role: UserRole | null;
  loading: boolean;
  /** Re-fetch the profile (e.g. after a profile update) */
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  authUser: null,
  role: null,
  loading: true,
  refresh: async () => {},
  signOut: async () => {},
});

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthUser(null);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('id, role, full_name, phone, updated_at')
        .eq('id', user.id)
        .single();

      if (!profile) {
        setAuthUser(null);
        return;
      }

      setAuthUser({
        id: user.id,
        email: user.email ?? null,
        role: profile.role as UserRole,
        profile,
        raw: user,
      });
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Initial fetch
    fetchProfile();

    // Subscribe to auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile();
      } else {
        setAuthUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, supabase]);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        role: authUser?.role ?? null,
        loading,
        refresh: fetchProfile,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth ───────────────────────────────────────────────────────────────────

/**
 * Returns the current authenticated user, their role, and loading state.
 *
 * @example
 * const { authUser, role, loading } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}

// ── useRequireRole ────────────────────────────────────────────────────────────

/**
 * Redirects the user if their role does not match the required role.
 * Safe to call in any client component that is behind the middleware guard.
 *
 * @example
 * // Inside a /doctor/* page:
 * const { authUser } = useRequireRole('doctor');
 */
export function useRequireRole(requiredRole: UserRole) {
  const { authUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!authUser) {
      const loginPath = ROLE_ROUTE_CONFIG[requiredRole].loginPath;
      router.replace(loginPath);
      return;
    }

    if (authUser.role !== requiredRole) {
      // Redirect to the user's own dashboard
      const correctConfig = ROLE_ROUTE_CONFIG[authUser.role];
      router.replace(correctConfig.defaultDashboard);
    }
  }, [authUser, loading, requiredRole, router]);

  return { authUser, loading };
}
