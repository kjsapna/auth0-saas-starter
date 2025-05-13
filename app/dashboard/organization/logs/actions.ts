"use server"

import { managementClient } from "@/lib/auth0"
import { withServerActionAuth } from "@/lib/with-server-action-auth"
import { Session } from "@auth0/nextjs-auth0"
import { handleError, USERS_PER_PAGE, SEARCH_ENGINE } from "@/lib/utils"
import { ADMIN_ROLES } from "@/lib/constants"

interface QueryParams {
  page?: number
  query?: string
}

export const fetchUsers = withServerActionAuth(
  async (queryParams: QueryParams, session: Session) => {
    try {
      const { page = 0, query = "" } = queryParams
      
      // Build search query
      const searchQuery = [
        `organization_id:"${session.user.org_id}"`,
        query && `(name:${query}* OR email:${query}*)`
      ]
        .filter(Boolean)
        .join(" AND ")

      const users = await managementClient.users.getAll({
        q: searchQuery,
        search_engine: SEARCH_ENGINE,
        per_page: USERS_PER_PAGE,
        page,
      })

      // Deep clone users to ensure serialization
      return JSON.parse(JSON.stringify(users))
    } catch (error) {
      return handleError("fetch users", error)
    }
  },
  { role: ADMIN_ROLES }
)
