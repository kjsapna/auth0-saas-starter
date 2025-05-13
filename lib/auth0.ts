import { config } from "@/config"
import { initAuth0 } from "@auth0/nextjs-auth0"
import { ManagementClient } from "auth0"

export const managementClient = new ManagementClient({
  domain: config.auth0.managementApiDomain,
  clientId: config.auth0.managementClientId,
  clientSecret: config.auth0.managementClientSecret,
})

export const onboardingClient = initAuth0({
  clientID: config.auth0.managementClientId,
  clientSecret: config.auth0.managementClientSecret,
  baseURL: config.app.baseUrl,
  issuerBaseURL: `https://${config.next.publicUrl}`,
  secret: config.app.sessionEncryptionSecret,
  routes: {
    callback: "/onboarding/callback",
    postLogoutRedirect: "/",
  },
})
export const auth0Client = initAuth0({
  clientID: config.auth0.clientId,
  clientSecret: config.auth0.clientSecret,
  baseURL: config.app.baseUrl,
  issuerBaseURL: `https://${config.next.publicUrl}`,
  secret: config.app.sessionEncryptionSecret,
  idpLogout: true,
})
