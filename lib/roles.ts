import { UserProfile } from "@auth0/nextjs-auth0/client";
import { config } from "@/config"

export type Role = "member" | "admin" | "NGEAdmin"

const ROLES_CLAIM_KEY = `${config.auth0.customNamespace}/roles`

export const roles = {
  member: config.auth0.role.memberId,
  admin: config.auth0.role.adminId,
  NGEAdmin: config.auth0.role.nextgenAdminId,
} as const

export function getRole(user: UserProfile) {
  // we only allow a single role to be assigned to a user
 
 
  const role = (user[ROLES_CLAIM_KEY] as Role[])[0]


  // if no role is assigned, set them to the default member role
   return role || "member"
   
}
