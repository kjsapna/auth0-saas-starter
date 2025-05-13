import type { Role } from "@/lib/roles";

export const DOMAIN_VERIFICATION_RECORD_IDENTIFIER =
  "saastart-domain-verification"

export const PATHS = {
  // Dashboard paths
  DASHBOARD: {
    ROOT: "/dashboard",
    ORGANIZATION: {
      ROOT: "/dashboard/organization",
      MEMBERS: "/dashboard/organization/members",
      GENERAL: "/dashboard/organization/general",
      LOGS: "/dashboard/organization/logs",
      SSO: "/dashboard/organization/sso",
      SECURITY_POLICIES: "/dashboard/organization/security-policies"
    },
    ACCOUNT: {
      ROOT: "/dashboard/account",
      PROFILE: "/dashboard/account/profile",
      SECURITY: "/dashboard/account/security"
    }
  },
  // Auth paths
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout"
  },
  // Onboarding paths
  ONBOARDING: {
    ROOT: "/onboarding",
    SIGNUP: "/onboarding/signup",
    VERIFY: "/onboarding/verify",
    CREATE: "/onboarding/create"
  },
  // Layout paths (for full page revalidation)
  LAYOUT: {
    ROOT: "/",
    DASHBOARD: "/dashboard"
  },
} as const

// Type for path values
export type PathValue = typeof PATHS[keyof typeof PATHS][keyof typeof PATHS[keyof typeof PATHS]]

export const ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
  NGEADMIN: 'NGEAdmin'
}

export const ADMIN_ROLES: Role[] = [ROLES.ADMIN as Role, ROLES.NGEADMIN as Role];
