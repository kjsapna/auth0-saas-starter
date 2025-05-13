import { redirect } from "next/navigation"

import { SidebarNav } from "@/components/sidebar-nav"
import { auth0Client, managementClient } from "@/lib/auth0"
import { ADMIN_ROLES, PATHS, ROLES } from "@/lib/constants"
import { getRole } from "@/lib/roles"
import { MembersList } from "./memberList"

const sidebarNavItems = [
  {
    title: "General Settings",
    href: "/dashboard/organization/general",
  },
  {
    title: "Members",
    href: "/dashboard/organization/members",
  },
  {
    title: "User logs",
    href: "/dashboard/organization/logs",
  },
]



interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await auth0Client.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect(PATHS.AUTH.LOGIN)
  }

  const userRole = getRole(session.user);

  if(userRole === ROLES.NGEADMIN){
    sidebarNavItems.push({
        title: "SSO",
        href: "/dashboard/organization/sso",
      });
  }

  const accessRole = ADMIN_ROLES 

  if (!accessRole.includes(userRole)) {
    const { data: members } = await managementClient.organizations.getMembers({
      id: session!.user.org_id,
      fields: ["user_id", "name", "email", "picture"].join(","),
      include_fields: true,
    })
    return (
      <MembersList members={members.map((m) => ({
                id: m.user_id,
                name: m.name,
                email: m.email,
                picture: m.picture,
              }))}/>
    )
  }

  return (
    <div className="space-y-1">
      <div className="flex min-h-full flex-col space-y-8 lg:flex-row lg:space-x-4 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="rounded-2xl border border-border bg-field p-2 shadow-sm lg:w-4/5">
          <div className="mx-auto max-w-6xl">{children}</div>
        </div>
      </div>
    </div>
  )
}
