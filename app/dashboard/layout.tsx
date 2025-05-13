import { UserProvider } from "@auth0/nextjs-auth0/client"
import { SettingsIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Auth0Logo } from "@/components/auth0-logo"
import { ModeToggle } from "@/components/mode-toggle"
import { OrganizationSwitcher } from "@/components/organization-switcher"
import { Button } from "@/components/ui/button"
import { UserNav } from "@/components/user-nav"
import { auth0Client, managementClient } from "@/lib/auth0"
import { getRole } from "@/lib/roles"
import { PATHS, ROLES } from "@/lib/constants"

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth0Client.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect(PATHS.AUTH.LOGIN)
  }

  const { data: orgs } = await managementClient.users.getUserOrganizations({
    id: session.user.sub,
  })

  const isNGEAdmin = getRole(session.user) === ROLES.NGEADMIN;

  // if the user does not belong to any organizations, redirect to onboarding
  if (!orgs.length) {
    redirect(PATHS.ONBOARDING.CREATE)
  }

  return (
    <UserProvider>
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-2 py-4 sm:px-8">
        <div className="flex items-center space-x-6">
          <OrganizationSwitcher
            organizations={orgs.map((o) => ({
              id: o.id,
              slug: o.name,
              displayName: o.display_name,
              logoUrl: o.branding?.logo_url,
            }))}
            currentOrgId={session.user.org_id}
            isNGEAdmin={isNGEAdmin}
          />

          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Home
          </Link>
        </div>

        <div className="flex flex-row gap-x-4">
          <Button variant="ghost" asChild className="px-2 py-2">
            <Link href="/dashboard/organization/general">
              <SettingsIcon className="h-[1.2rem] w-[1.2rem]" />
            </Link>
          </Button>
          <UserNav />
        </div>
      </nav>

      <main className="mx-auto grid min-h-[calc(100svh-164px)] max-w-7xl px-2 sm:px-8 lg:py-6">
        {children}
      </main>

      <footer className="mx-auto max-w-7xl px-2 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between">
          <div className="flex items-center space-x-2">
            <Auth0Logo className="h-6 w-6" />

            <div className="font-mono font-semibold">
              <Link href="/">Delegated Admin Console</Link>
            </div>

            <div>
              <Button variant="link" asChild>
                <Link href="/">Home</Link>
              </Button>
            </div>
          </div>

          <div className="items-center gap-x-2">
            <ModeToggle />
          </div>
        </div>
      </footer>
    </UserProvider>
  )
}
