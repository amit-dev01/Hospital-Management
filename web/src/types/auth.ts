import type { User } from '@supabase/supabase-js';

// ── Roles ─────────────────────────────────────────────────────────────────────
export type UserRole = 'patient' | 'doctor' | 'admin';

// ── Profile row from the `profiles` table ─────────────────────────────────────
export interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  updated_at: string | null;
}

// ── Enriched user object passed around the app ────────────────────────────────
export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  profile: UserProfile;
  /** Raw Supabase auth User — available when needed */
  raw: User;
}

// ── Per-role route configuration ─────────────────────────────────────────────
export interface RoleRouteConfig {
  /** URL path prefix that is protected for this role */
  prefix: string;
  /** Where to redirect if the user is not authenticated at all */
  loginPath: string;
  /** Where to redirect after login */
  defaultDashboard: string;
}

export const ROLE_ROUTE_CONFIG: Record<UserRole, RoleRouteConfig> = {
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

/** All protected route prefixes (used for fast matching) */
export const ALL_PROTECTED_PREFIXES = Object.values(ROLE_ROUTE_CONFIG).map(
  (c) => c.prefix,
);
