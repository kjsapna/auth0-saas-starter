"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { appClient, managementClient } from "@/lib/auth0"

export async function updateDisplayName(formData: FormData) {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  const displayName = formData.get("display_name")
  const phoneNumber = formData.get("phone_number") as string
  const givenName = formData.get("given_name") as string
  const familyName = formData.get("family_name") as string
  const nickname = formData.get("nickname") as string
  const username = formData.get("username") as string
  const email = formData.get("email") as string


  if (!displayName || typeof displayName !== "string") {
    return {
      error: "Display name is required.",
    }
  }

  try {
    if(username){
      await managementClient.users.update(
        {
          id: session.user.sub,
        },
        {
         username:username
        }
      )
    }
    await managementClient.users.update(
      { 
        id: session.user.sub,
      },
      {
        name: displayName,
        phone_number: phoneNumber,
        given_name: givenName,
        family_name: familyName,
        nickname: nickname,
        email: email,
      }
    )

    // update the cached local session to reflect the new display name across the app
    await appClient.updateSession({
      ...session,
      user: {
        ...session.user,
        name: displayName,
        phone_number: phoneNumber,
        given_name: givenName,
        family_name: familyName,
        nickname: nickname,
        email:email,
        username: username,
      },
    })
    revalidatePath("/", "layout")
  } catch (error) {
    console.error("failed to update display name", error)
    return {
      error: "Failed to update account.",
    }
  }

  return {}
}

export async function deleteAccount() {
  const session = await appClient.getSession()

  if (!session) {
    return redirect("/api/auth/login")
  }

  try {
    await managementClient.users.delete({
      id: session.user.sub,
    })

    return {}
  } catch (error) {
    console.error("failed to delete account", error)
    return {
      error: "Failed to delete your account.",
    }
  }
}

export async function changePassword(userId: string, newPassword: string) {
  try {
    const session = await appClient.getSession()
    await managementClient.users.update(
      {
        id: session?.user.sub,
      },
      {
        password: newPassword,
      }
    )

    return { success: true, message: "Password changed successfully." }
  } catch (error: any) {
    console.error("Error changing password:", error)
    return { success: false, error: error.message }
  }
}
