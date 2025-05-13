"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth0Client, managementClient } from "@/lib/auth0"
import { handleError, validateString } from "@/lib/utils"
import { PATHS } from "@/lib/constants"

interface UserProfile {
  display_name: string
  phone_number: string
  given_name: string
  family_name: string
  nickname: string
  username: string
  email: string
}

export async function updateDisplayName(formData: FormData) {
  const session = await auth0Client.getSession()

  if (!session) {
    return redirect(PATHS.AUTH.LOGIN)
  }

  const profile: UserProfile = {
    display_name: formData.get("display_name") as string,
    phone_number: formData.get("phone_number") as string,
    given_name: formData.get("given_name") as string,
    family_name: formData.get("family_name") as string,
    nickname: formData.get("nickname") as string,
    username: formData.get("username") as string,
    email: formData.get("email") as string,
  }

  if (!validateString(profile.display_name)) {
    return { error: "Display name is required." }
  }

  try {
    // Update username if provided
    if (profile.username) {
      await managementClient.users.update(
        { id: session.user.sub },
        { username: profile.username }
      )
    }

    // Update user profile
    await managementClient.users.update(
      { id: session.user.sub },
      {
        name: profile.display_name,
        given_name: profile.given_name,
        family_name: profile.family_name,
        nickname: profile.nickname,
        email: profile.email,
        user_metadata: {
          phone_number: profile.phone_number
        }
      }
    )

    // Update the cached local session
    await auth0Client.updateSession({
      ...session,
      user: {
        ...session.user,
        name: profile.display_name,
        phone_number: profile.phone_number,
        given_name: profile.given_name,
        family_name: profile.family_name,
        nickname: profile.nickname,
        email: profile.email,
        username: profile.username,
      },
    })

    revalidatePath(PATHS.LAYOUT.ROOT, "layout")
    return {}
  } catch (error) {
    return handleError("update account", error)
  }
}

export async function deleteAccount() {
  const session = await auth0Client.getSession()

  if (!session) {
    return redirect(PATHS.AUTH.LOGIN)
  }

  try {
    await managementClient.users.delete({
      id: session.user.sub,
    })
    return {}
  } catch (error) {
    return handleError("delete account", error)
  }
}

export async function changePassword(userId: string, newPassword: string) {
  try {
    const session = await auth0Client.getSession()
    
    if (!session) {
      return { success: false, error: "No active session found." }
    }

    await managementClient.users.update(
      { id: session.user.sub },
      { password: newPassword }
    )

    return { success: true, message: "Password changed successfully." }
  } catch (error) {
    console.error("Error changing password:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to change password." 
    }
  }
}
