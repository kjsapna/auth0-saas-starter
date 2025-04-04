"use server"

import { revalidatePath } from "next/cache"
import { Session } from "@auth0/nextjs-auth0"

import { managementClient } from "@/lib/auth0"
import { Role, roles } from "@/lib/roles"
import { withServerActionAuth } from "@/lib/with-server-action-auth"

export const createInvitation = withServerActionAuth(
  async function createInvitation(formData: FormData, session: Session) {
    const email = formData.get("email")

    if (!email || typeof email !== "string") {
      return {
        error: "Email address is required.",
      }
    }

    const role = formData.get("role") as Role

    if (
      !role ||
      typeof role !== "string" ||
      !["member", "admin"].includes(role)
    ) {
      return {
        error: "Role is required and must be either 'member' or 'admin'.",
      }
    }

    try {
      const roleId = roles[role]

      await managementClient.organizations.createInvitation(
        {
          id: session.user.org_id,
        },
        {
          invitee: {
            email,
          },
          inviter: {
            name: session.user.name,
          },
          client_id: process.env.AUTH0_CLIENT_ID,
          // if the roleId exists, then assign it. Regular members do not have a role assigned,
          // only admins are assigned a specific role.
          roles: roleId ? [roleId] : undefined,
        }
      )

      revalidatePath("/dashboard/organization/members")
    } catch (error) {
      console.error("failed to create invitation", error)
      return {
        error: "Failed to create invitation.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

export const revokeInvitation = withServerActionAuth(
  async function revokeInvitation(invitationId: string, session: Session) {
    try {
      await managementClient.organizations.deleteInvitation({
        id: session.user.org_id,
        invitation_id: invitationId,
      })

      revalidatePath("/dashboard/organization/members")
    } catch (error) {
      console.error("failed to revoke invitation", error)
      return {
        error: "Failed to revoke invitation.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

export const removeMember = withServerActionAuth(
  async function removeMember(userId: string, session: Session) {
    if (userId === session.user.sub) {
      return {
        error: "You cannot remove yourself from an organization.",
      }
    }

    try {
      await managementClient.organizations.deleteMembers(
        {
          id: session.user.org_id,
        },
        {
          members: [userId],
        }
      )

      revalidatePath("/dashboard/organization/members")
    } catch (error) {
      console.error("failed to remove member", error)
      return {
        error: "Failed to remove member.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

export const blockMember = withServerActionAuth(
  async function blockMember(userId: string, blocked:boolean, session: Session) {
    if (userId === session.user.sub) {
      return {
        error: "You cannot block yourself from an organization.",
      }
    }

    try {
      await managementClient.users.update(
        {
          id: userId,
        },
        {
          blocked:!blocked
        }
      )

      revalidatePath("/dashboard/organization/members")
    } catch (error) {
      console.error("failed to remove member", error)
      return {
        error: "Failed to remove member.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

export const updateRole = withServerActionAuth(
 // async function updateRole(userId: string, selectedRole:{name: string, id: string, description: string}, session: Session) {
  async function updateRole(userId: string, role: Role, session: Session) {
    if (userId === session.user.sub) {
      return {
        error: "You cannot update your own role.",
      }
    }

    if (
      !role ||
      typeof role !== "string" ||
      !["member", "admin"].includes(role)
    ) {
      return {
        error: "Role is required and must be either 'member' or 'admin'.",
      }
    }
    const roleId = roles[role]

    //const roleId = selectedRole.id;

    try {
      const { data: currentRoles } =
        await managementClient.organizations.getMemberRoles({
          id: session.user.org_id,
          user_id: userId,
        })

      // if the user has any existing roles, remove them
      if (currentRoles.length) {
        await managementClient.organizations.deleteMemberRoles(
          {
            id: session.user.org_id,
            user_id: userId,
          },
          {
            roles: currentRoles.map((r) => r.id),
          }
        )
      }

      // if the user is being assigned a non-member role (non-null), set the new role
      if (roleId) {
        await managementClient.organizations.addMemberRoles(
          {
            id: session.user.org_id,
            user_id: userId,
          },
          {
            roles: [roleId],
          }
        )
      }

      revalidatePath("/dashboard/organization/members")
    } catch (error) {
      console.error("failed to update member's role", error)
      return {
        error: "Failed to update member's role.",
      }
    }

    return {}
  },
  {
    role: "admin",
  }
)

const sendPasswordResetLink = async (email: string) => {
  const response = await fetch(
    `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/dbconnections/change_password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        connection: process.env.DEFAULT_CONNECTION,
        organization_id: process.env.DEFAULT_CONNECTION_ID,
      }),
    }
  )
  return response.json()
}
export const passwordResetLink = withServerActionAuth(
  async function passwordResetLink(
    userId: string,
    email: string,
    session: Session
  ) {
    try {
      await sendPasswordResetLink(email)
      revalidatePath("/dashboard/organization/members")
      console.log("If the email exists, a reset link has been sent.")
    } catch (error) {
      console.error("failed to sent reset password link", error)
      return {
        error: "Failed  to sent reset password link.",
      }
    }
    return {}
  },
  {
    role: "admin",
  }
)
export const bulkPasswordResetLink = withServerActionAuth(
  async function bulkPasswordResetLink(emails: string[], session: Session) {
    try {
      const batchSize = 10;
      const results = []
      for (let i = 0; i < emails.length; i += batchSize) {
        const batch = emails.slice(i, i + batchSize)
        console.log(`Processing batch: ${i / batchSize + 1}`)
        const batchResults = await Promise.allSettled(
          batch.map((email) => sendPasswordResetLink(email)) // Wrap email in an array for API
        )
        results.push(...batchResults)
      }
      return {}
    } catch (error) {
      console.error("failed to sent reset password link", error)
      return {
        error: "Failed  to sent reset password link.",
      }
    }
  },
  {
    role: "admin",
  }
)

export const addGrouptoUser = withServerActionAuth(
async function addGrouptoUser(userId: string, group: string[],session: Session) {

  try {
    await managementClient.users.update(
      { id: userId },
      { user_metadata: { group } }
    );
    return { error: null };
  } catch (error) {
    return { error: "Cannot assign group to the user"};
  }
},
{
  role: "admin",
}
)

