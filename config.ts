interface Config {
  auth0: {
    domain: string
    clientId: string
    clientSecret: string
    audience: string
    scope: string
    managementApiDomain: string
    managementClientId: string
    managementClientSecret: string
    role: {
      memberId: string
      adminId: string
      nextgenAdminId: string
    }
    customNamespace: string
    defaultConnectionId: string
  }
  api: {
    middlewareUrl: string
    adDomain: string
    saUser: string
    saPassword: string
  }
  next: {
    publicUrl: string
    baseUrl: string
  }
  app: {
    baseUrl: string
    sessionEncryptionSecret: string
  }
  node: {
    env: string
  }
}

// Validate required environment variables
const requiredEnvVars = [
  'AUTH0_CLIENT_ID',
  'AUTH0_CLIENT_SECRET',
  'AUTH0_MANAGEMENT_API_DOMAIN',
  'AUTH0_MANAGEMENT_CLIENT_ID',
  'AUTH0_MANAGEMENT_CLIENT_SECRET',
  'API_MIDDLEWARE_URL',
  'AD_domain',
  'SA_user',
  'SA_password',
  'NEXT_PUBLIC_AUTH0_DOMAIN',
  'APP_BASE_URL',
  'SESSION_ENCRYPTION_SECRET',
  'CUSTOM_CLAIMS_NAMESPACE',
  'DEFAULT_CONNECTION_ID',
  'AUTH0_ADMIN_ROLE_ID',
  'AUTH0_MEMBER_ROLE_ID',
  'AUTH0_NEXTGEN_ADMIN_ROLE_ID'
] as const


for (const envVar of requiredEnvVars) {
 
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}

export const config: Config = {
  auth0: {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    audience: process.env.AUTH0_AUDIENCE!,
    scope: process.env.AUTH0_SCOPE!,
    managementApiDomain: process.env.AUTH0_MANAGEMENT_API_DOMAIN!,
    managementClientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
    managementClientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET!,
    role: {
      memberId: process.env.AUTH0_ADMIN_ROLE_ID!,
      adminId: process.env.AUTH0_MEMBER_ROLE_ID!,
      nextgenAdminId: process.env.AUTH0_NEXTGEN_ADMIN_ROLE_ID!,
    },
    customNamespace: process.env.CUSTOM_CLAIMS_NAMESPACE!,
    defaultConnectionId: process.env.DEFAULT_CONNECTION_ID!
  },
  api: {
    middlewareUrl: process.env.API_MIDDLEWARE_URL!,
    adDomain: process.env.AD_domain!,
    saUser: process.env.SA_user!,
    saPassword: process.env.SA_password!,
  },
  next: {
    publicUrl: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
    baseUrl: process.env.APP_BASE_URL!
  },
  app: {
    baseUrl: process.env.APP_BASE_URL!,
    sessionEncryptionSecret: process.env.SESSION_ENCRYPTION_SECRET!
  },
  node: {
    env: process.env.NODE_ENV || 'development'
  }
} 