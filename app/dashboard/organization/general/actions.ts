"use server"

import { managementClient } from "@/lib/auth0"
import { withServerActionAuth } from "@/lib/with-server-action-auth"
import { Session } from "@auth0/nextjs-auth0"
import { revalidatePath } from "next/cache"
import { handleError, validateString } from "@/lib/utils"
import { PATHS, ADMIN_ROLES } from "@/lib/constants"

export const updateDisplayName = withServerActionAuth(
  async function updateDisplayName(formData: FormData, session: Session) {
    const displayName = formData.get("display_name")

    if (!validateString(displayName)) {
      return { error: "Display name is required." }
    }

    try {
      await managementClient.organizations.update(
        { id: session.user.org_id },
        { display_name: displayName }
      )

      revalidatePath(PATHS.LAYOUT.ROOT, "layout")
      return {}
    } catch (error) {
      return handleError("update organization display name", error)
    }
  },
  { role: ADMIN_ROLES }
)
