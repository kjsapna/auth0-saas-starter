import { redirect } from "next/navigation";

import { auth0Client } from "@/lib/auth0";
import { getRole } from "@/lib/roles";
import { PATHS } from "@/lib/constants";

export default async function DashboardHome() {
  const session = await auth0Client.getSession()
  // if the user is not authenticated, redirect to login

  if (!session?.user) {
    redirect(PATHS.AUTH.LOGIN)
  }

  const isMember = getRole(session.user) === "member"
  return isMember
    ? redirect(PATHS.DASHBOARD.ACCOUNT.PROFILE)
    : redirect(PATHS.DASHBOARD.ORGANIZATION.GENERAL)
}
