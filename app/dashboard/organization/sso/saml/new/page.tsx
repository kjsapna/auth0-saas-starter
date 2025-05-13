
import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { auth0Client } from "@/lib/auth0"
import { getOrCreateDomainVerificationToken } from "@/lib/domain-verification"

import { config } from "@/config"
import { CreateSamlConnectionForm } from "./create-saml-connection-form"

export default async function CreateSamlConnection() {
  const session = await auth0Client.getSession()

  const domainVerificationToken = await getOrCreateDomainVerificationToken(
    session!.user.org_id
  )
const publicUrl = `https://${config.next.publicUrl}`
  return (
    <div className="space-y-1">
      <div className="px-2 py-3">
        <AppBreadcrumb
          title="Back to connections"
          href="/dashboard/organization/sso"
        />
      </div>

      <CreateSamlConnectionForm
        domainVerificationToken={domainVerificationToken}
        publicUrl={publicUrl}
      />
    </div>
  )
}
