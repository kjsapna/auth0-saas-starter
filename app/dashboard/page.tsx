import Link from "next/link"
import { ArrowRightIcon } from "@radix-ui/react-icons"

import { Button } from "@/components/ui/button"

export default async function DashboardHome() {
  return (
    <div className="flex flex-1 flex-grow flex-col gap-4 lg:gap-6">
      <div className="flex flex-1 items-center justify-center rounded-3xl border bg-field shadow-sm">
        <div className="flex max-w-[500px] flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
          Explore the NexGen App Dashboard
          </h3>
          <p className="mt-3 text-muted-foreground">
          The NexGen App Dashboard is your hub for managing a multi-tenant B2B SaaS application.
          </p>
          <p className="mt-3 text-muted-foreground">
          isit the Settings Dashboard to explore key administrative features such as membership management, single sign-on (SSO) configuration, and security policies to streamline your organization's access and security.
          </p>
          <div className="mt-8">
            <Link href="/dashboard/organization/general" className="w-full">
              <Button className="w-full">
                Navigate to Settings
                <ArrowRightIcon className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-muted-foreground">
            (You must be logged in with an &quot;admin&quot; role in your
            organization.)
          </p>
        </div>
      </div>
    </div>
  )
}
