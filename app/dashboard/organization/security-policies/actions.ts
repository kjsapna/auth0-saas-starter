"use server"

import { revalidatePath } from "next/cache"
import { managementClient } from "@/lib/auth0"
import { withServerActionAuth } from "@/lib/with-server-action-auth"
import { Session } from "@auth0/nextjs-auth0"
import { PATHS, ADMIN_ROLES } from "@/lib/constants"
import {DEFAULT_MFA_POLICY, SUPPORTED_PROVIDERS } from "@/lib/mfa-policy"
import { handleError } from "@/lib/utils"


export const updateMfaPolicy = withServerActionAuth(
  async function updateMfaPolicy(formData: FormData, session: Session) {
    const enforce = !!formData.get("enforce")
    const skipForDomains = formData.get("skip_for_domains")
    const providers = SUPPORTED_PROVIDERS.map((p) => formData.get(p)).filter(
      Boolean
    )

    const parsedSkipForDomains =
      skipForDomains && typeof skipForDomains === "string"
        ? skipForDomains.split(",").map((d) => d.trim())
        : []

    try {
      await managementClient.organizations.update(
        {
          id: session.user.org_id,
        },
        {
          metadata: {
            mfaPolicy: JSON.stringify({
              ...DEFAULT_MFA_POLICY,
              enforce,
              skipForDomains: parsedSkipForDomains,
              providers,
            }),
          },
        }
      )

      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.SECURITY_POLICIES)
    } catch (error) {
      return handleError("update the organization's MFA policy", error)
      
    }

    return {}
  },
  {
    role: ADMIN_ROLES,
  }
)
