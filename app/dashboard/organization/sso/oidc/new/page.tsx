import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { auth0Client } from "@/lib/auth0"
import { getOrCreateDomainVerificationToken } from "@/lib/domain-verification"

import { config } from "@/config"
import { CreateOidcConnectionForm } from "./create-oidc-connection-form"

export default async function CreateOidcConnection() {
  const session = await auth0Client.getSession()

  const domainVerificationToken = await getOrCreateDomainVerificationToken(
    session!.user.org_id
  )

  const CALLBACK_URL = `https://${config.next.publicUrl}/login/callback`

  return (
    <div className="space-y-1">
      <div className="px-2 py-3">
        <AppBreadcrumb
          title="Back to connections"
          href="/dashboard/organization/sso"
        />
      </div>

      <CreateOidcConnectionForm
        domainVerificationToken={domainVerificationToken}
        CALLBACK_URL={CALLBACK_URL}
      />
    </div>
  )
}
