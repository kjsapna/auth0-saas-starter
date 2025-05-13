import { auth0Client, managementClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"
import { config } from "@/config"

import { ConnectionsList } from "./connections-list"

export default async function SSO() {
  const session = await auth0Client.getSession()
  const { data: connections } =
    await managementClient.organizations.getEnabledConnections({
      id: session!.user.org_id,
    })

  return (
    <div className="space-y-2">
      <PageHeader
        title="Single Sign-On"
        description="Configure SSO for your organization."
      />

      <ConnectionsList
        connections={connections
          // filter out the default connection ID assigned to all organizations
          .filter((c) => c.connection_id !== config.auth0.defaultConnectionId)
          .map((c) => ({
            id: c.connection_id,
            name: c.connection.name,
            strategy: c.connection.strategy,
            assignMembershipOnLogin: c.assign_membership_on_login,
          }))}
      />
    </div>
  )
}
