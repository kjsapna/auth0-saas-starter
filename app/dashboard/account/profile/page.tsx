import { appClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import { DeleteAccountForm } from "./delete-account-form"
import { DisplayNameForm } from "./display-name-form"
import { ChangePasswordForm } from "./change-password-form"
export default appClient.withPageAuthRequired(
  async function Profile() {
    const session = await appClient.getSession()
    return (
      <div className="space-y-2">
        <PageHeader
          title="Profile"
          description="Manage your personal information."
        />

        <DisplayNameForm displayName={session?.user.name} />

      <ChangePasswordForm userId={session?.user.sub}/>
        <DeleteAccountForm />

      </div>
    )
  },
  { returnTo: "/dashboard/account/profile" }
)
