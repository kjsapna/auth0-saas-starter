"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { auth0Client, managementClient } from "@/lib/auth0"
import { Result, error, handleError, success } from "@/lib/utils"
import { PATHS } from "@/lib/constants"

export async function createEnrollment(formData: FormData): Promise<Result<{ ticketUrl: string }>> {
  const session = await auth0Client.getSession()

  if (!session) {
    return redirect(PATHS.AUTH.LOGIN)
  }

  let factorName = formData.get("factor_name")

  if (!factorName || typeof factorName !== "string") {
    return error<{ ticketUrl: string }>("Factor name is required.")
  }

  try {
    const userId = session?.user.sub

    if (factorName === "sms" || factorName === "voice") {
      factorName = "phone"
    }

    const { data: enrollmentTicket } =
      await managementClient.guardian.createEnrollmentTicket({
        user_id: userId,
        //@ts-ignore
        factor: factorName,
        allow_multiple_enrollments: true,
      })

    revalidatePath(PATHS.DASHBOARD.ACCOUNT.SECURITY, "layout")

    return success({ ticketUrl: enrollmentTicket.ticket_url })
  } catch (error) {
    return handleError<{ ticketUrl: string }>("create enrollment ticket", error)
  }
}

export async function deleteEnrollment(formData: FormData): Promise<Result> {
  const session = await auth0Client.getSession()

  if (!session) {
    return redirect(PATHS.AUTH.LOGIN)
  }

  let enrollmentId = formData.get("enrollment_id")

  if (!enrollmentId || typeof enrollmentId !== "string") {
    return error("Enrollment ID is required.")
  }

  try {
    const userId = session?.user.sub

    await managementClient.users.deleteAuthenticationMethod({
      id: userId,
      authentication_method_id: enrollmentId,
    })

    revalidatePath(PATHS.DASHBOARD.ACCOUNT.SECURITY, "layout")

    return success(undefined)
  } catch (error) {
    return handleError("delete enrollment", error)
  }
}



