import { PageHeader } from "@/components/page-header"
import { auth0Client } from "@/lib/auth0"
import { config } from "@/config"

import { ChangePasswordForm } from "./change-password-form"
import { DeleteAccountForm } from "./delete-account-form"
import { DisplayNameForm } from "./display-name-form"

interface UserProfile {

  given_name?: string
  family_name?: string
  nickname?: string
  username?: string
  email?: string
  phone_number?: string
  user_metadata?:{
    phoneNumber?:string
  }

}
export default auth0Client.withPageAuthRequired(
  async function Profile() {
    const session = await auth0Client.getSession()
    const getUserProfile = (): UserProfile => {
      const user = session?.user;
      if (!user) {
        return {}
      }

      const user_metadata = session.user[config.auth0.customNamespace + 'user_metadata'];

      return {
        phone_number: user_metadata?.phoneNumber ?? "",
        given_name: user.given_name ?? "",
        family_name: user.family_name ?? "",
        nickname: user.nickname ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        user_metadata:user_metadata
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
