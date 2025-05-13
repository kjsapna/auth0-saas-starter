import { redirect } from "next/navigation"

import { auth0Client } from "@/lib/auth0"
import { PATHS } from "@/lib/constants"


export default async function Home() {
  const session = await auth0Client.getSession()

  return (
    <div className="container relative h-screen flex-col items-center justify-center sm:grid md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {session ? redirect(PATHS.AUTH.LOGOUT) : redirect(PATHS.AUTH.LOGIN)}
    </div>
  )
}
