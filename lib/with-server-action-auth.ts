import { Session } from "@auth0/nextjs-auth0"

import { auth0Client } from "./auth0"
import { getRole, Role } from "./roles"

interface Options {
  role?: Role[]
}

/**
 * withServerActionAuth wraps a Server Action to ensure a user is authenticated.
 * Optionally, if a role is supplied, then the user must have that role to invoke the Server Action.
 */
export function withServerActionAuth<T extends any[], U extends any>(
  serverActionWithSession: (...args: [...T, session: Session]) => U,
  options: Options
) {
  return async function (...args: T) {
    const session = await auth0Client.getSession()

    if (!session) {
      return {
        error: "You must be authenticated to perform this action.",
      }
    }
    const userRoles = getRole(session.user);
if (options.role && options.role.length > 0 && !options.role.some(role => userRoles.includes(role))) {
  return {
    error: `You must have one of the following roles: ${options.role.join(", ")}.`,
  };
}
    return serverActionWithSession(...args, session)
  }
}
