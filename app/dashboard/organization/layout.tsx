import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeftIcon } from "@radix-ui/react-icons"

import { appClient,managementClient } from "@/lib/auth0"
import { getRole } from "@/lib/roles"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { SidebarNav } from "@/components/sidebar-nav"
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
  // {
  //   title: "SSO",
  //   href: "/dashboard/organization/sso",
  // },
  // {
  //   title: "Security Policies",
  //   href: "/dashboard/organization/security-policies",
  // },
  {
    title: "User logs",
    href: "/dashboard/organization/logs",
  },
]

interface AccountLayoutProps {
  children: React.ReactNode
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const session = await appClient.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect("/api/auth/login")
  }

  if (getRole(session.user) !== "admin") {
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
