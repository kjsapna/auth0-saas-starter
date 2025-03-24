import { appClient, onboardingClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"

import { ChangePasswordForm } from "./change-password-form"
import { DeleteAccountForm } from "./delete-account-form"
import { DisplayNameForm } from "./display-name-form"

interface UserProfile {
  phone_number?: string
  given_name?: string
  family_name?: string
  nickname?: string
  username?: string
}
export default appClient.withPageAuthRequired(
  async function Profile() {
    const session = await appClient.getSession()
    //const sess = await onboardingClient.getSession()
    // console.log(sess)
    const getUserProfile = (): UserProfile => {
      const user = session?.user
      if (!user) {
        return {}
      }
      return {
        phone_number: user.phone_number || "",
        given_name: user.given_name || "",
        family_name: user.family_name || "",
        nickname: user.nickname || "",
        username: user.username || "",
      }
    }

    return (
      <div className="space-y-2">
        <PageHeader
          title="Profile"
          description="Manage your personal information."
        />

        <DisplayNameForm
          displayName={session?.user.name}
          userProfile={getUserProfile() || {}}
        />

        <ChangePasswordForm userId={session?.user.sub} />
        <DeleteAccountForm />
      </div>
    )
  },
  { returnTo: "/dashboard/account/profile" }
)
