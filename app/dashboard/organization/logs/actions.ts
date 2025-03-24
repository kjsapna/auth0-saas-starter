"use server"

import { Session } from "@auth0/nextjs-auth0"
import { managementClient } from "@/lib/auth0"
import { withServerActionAuth } from "@/lib/with-server-action-auth"

export const fetchUsers = withServerActionAuth(
  async (queryParams: { page?: number; query?: string; }, session: Session) => {
    try {
      const { page = 0, query = "" } = queryParams
      let search = `organization_id:"${session?.user.org_id}"`;
      if(query!=""){
        search+=` AND (name:${query}* OR email:${query}*)`
      }

      const users = await managementClient.users.getAll({
        q: search,
        search_engine: "v3",
        per_page: 10,
        page,
      })
      const plainUsers = JSON.parse(JSON.stringify(users));
 
      return plainUsers;
    } catch (error) {
      console.error("Error fetching users:", error)
      return { error: "Failed to fetch users." }
    }
  },
  { role: "admin" }
)
