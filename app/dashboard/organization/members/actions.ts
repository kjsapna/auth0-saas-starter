"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import axios from "axios"
import { parse } from "csv-parse/sync"

import { auth0Client, managementClient } from "@/lib/auth0"
import { Session } from "@auth0/nextjs-auth0"
import { Role, roles } from "@/lib/roles"
import { withServerActionAuth } from "@/lib/with-server-action-auth"
import { BATCH_SIZE, handleError, validateEmail, validateRole, Result, error, success } from "@/lib/utils"
import { config } from "@/config"
import { PATHS, ADMIN_ROLES } from "@/lib/constants"

const sendInvitationEmail = async (user: { email: string, role: string }, session: Session) => {
  if (!validateEmail(user.email)) {
    return error("Email address is required.")
  }

  if (!validateRole(user.role)) {
    return error("Role is required and must be either 'member' or 'admin'.")
  }

  const roleId = roles[user.role]

  await managementClient.organizations.createInvitation(
    { id: session.user.org_id },
    {
      invitee: { email: user.email },
      inviter: { name: session.user.name },
      client_id: config.auth0.clientId,
      roles: roleId ? [roleId] : undefined,
    }
  )
}

export const createInvitation = withServerActionAuth(
  async function createInvitation(formData: FormData, session: Session) {
    const email = formData.get("email")
    if (!email || typeof email !== "string") {
      return error("Email is required and must be a string.")
    }

    const user = {
      email,
      role: formData.get("role") as Role
    }

    try {
      await sendInvitationEmail(user, session);
      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return {}
    } catch (error) {
      return handleError("create invitation", error)
    }
  },
  { role: ADMIN_ROLES }
)

export const sendBulkIdPInvitation = withServerActionAuth(
  async function sendBulkIdPInvitation(emails: string[], session: Session) {
    try {
      const results = []

      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.allSettled(
          batch.map(email => sendInvitationEmail({ email: email, role: 'member' }, session))
        )
        results.push(...batchResults)
      }

      return {}
    } catch (error) {
      return handleError("send bulk idp invitation links", error)
    }

  }, { role: ADMIN_ROLES }
)

export const revokeInvitation = withServerActionAuth(
  async function revokeInvitation(invitationId: string, session: Session) {
    try {
      await managementClient.organizations.deleteInvitation({
        id: session.user.org_id,
        invitation_id: invitationId,
      })

      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return {}
    } catch (error) {
      return handleError("revoke invitation", error)
    }
  },
  { role: ADMIN_ROLES }
)

export const removeMember = withServerActionAuth(
  async function removeMember(userId: string, session: Session) {
    if (userId === session.user.sub) {
      return error("You cannot remove yourself from an organization.")
    }

    try {
      await managementClient.organizations.deleteMembers(
        { id: session.user.org_id },
        { members: [userId] }
      )

      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return {}
    } catch (error) {
      return handleError("remove member", error)
    }
  },
  { role: ADMIN_ROLES }
)

export const blockMember = withServerActionAuth(
  async function blockMember(userId: string, blocked:boolean, session: Session) {
    const { data: user } = await managementClient.users.get({
      id: userId
    });
    if (userId === session.user.sub) {
      return error("You cannot block yourself from an organization.")
    }

    try {
      await managementClient.users.update(
        { id: userId },
        { blocked: !blocked }
      )
      if(blocked){
        await unlockAD(user.username);
      }

      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return {}
    } catch (error) {
      return handleError("block member", error)
    }
  },
  { role: ADMIN_ROLES }
)

export async function unlockAD(username: string): Promise<Result> {
  try {
    await axios.get(`${config.api.middlewareUrl}/api/User/unlock/${username}`, {
      headers: {
        'content-type': 'application/json',
        'AD_domain': config.api.adDomain,
        'SA_user': config.api.saUser,
        'SA_password': config.api.saPassword
      }
    })
    return success(undefined)
  } catch (err) {
    return handleError("unlock account", err)
  }
}

export const updateRole = withServerActionAuth(
  async function updateRole(userId: string, role: Role, session: Session): Promise<Result> {
    if (userId === session.user.sub) {
      return error("You cannot update your own role.")
    }

    if (!validateRole(role)) {
      return error("Role is required and must be either 'member', 'admin' or 'NGEAdmin'.")
    }

    const roleId = roles[role]

    try {
      const { data: currentRoles } = await managementClient.organizations.getMemberRoles({
        id: session.user.org_id,
        user_id: userId,
      })

      if (currentRoles.length) {
        await managementClient.organizations.deleteMemberRoles(
          { id: session.user.org_id, user_id: userId },
          { roles: currentRoles.map((r) => r.id) }
        )
      }

      if (roleId) {
        await managementClient.organizations.addMemberRoles(
          { id: session.user.org_id, user_id: userId },
          { roles: [roleId] }
        )
      }

      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return success(undefined)
    } catch (err) {
      return handleError("update member's role", err)
    }
  },
  { role: ADMIN_ROLES }
)

const sendPasswordResetLink = async (email: string, session: Session) => {
  const result = await managementClient.usersByEmail.getByEmail({ email })
  const connection = result.data[0].identities[0].connection

  const response = await fetch(
    `https://${config.next.publicUrl}/dbconnections/change_password`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: config.auth0.clientId,
        email,
        connection,
        organization_id: session.user.org_id
      }),
    }
  )
  return response.json()
}

export const passwordResetLink = withServerActionAuth(
  async function passwordResetLink(userId: string, email: string, session: Session) {
    try {
      await sendPasswordResetLink(email, session)
      revalidatePath(PATHS.DASHBOARD.ORGANIZATION.MEMBERS)
      return {}
    } catch (error) {
      return handleError("send reset password link", error)
    }
  },
  { role: ADMIN_ROLES }
)

export const bulkPasswordResetLink = withServerActionAuth(
  async function bulkPasswordResetLink(emails: string[], session: Session) {
    const results: {
      email: string;
      status: 'fulfilled' | 'rejected';
      reason?: any;
      value?: any;
    }[] = [];
    try {

      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE)
        const batchResults = await Promise.allSettled(
          batch.map(email => sendPasswordResetLink(email, session))
        )
        batchResults.forEach((result, idx) => {
          const email = batch[idx];
          if (result.status === 'fulfilled') {
            results.push({ email, status: 'fulfilled', value: result.value });
          } else {
            results.push({ email, status: 'rejected', reason: result.reason });
          }
        });
      }

      return results;
    } catch (error) {
      return handleError("send bulk reset password links", error)
    }
  },
  { role: ADMIN_ROLES }
)

export const addGrouptoUser = withServerActionAuth(
  async function addGrouptoUser(userId: string, group: string[], session: Session) {
    try {
      await managementClient.users.update(
        { id: userId },
        { user_metadata: { AD_Group:group } }
      )
      return success(undefined)
    } catch (error) {
      return handleError("assign group to user", error)
    }
  },
  { role: ADMIN_ROLES }
)
interface CsvUser {
  "Display Name": string;
  "Username": string;
  "First Name": string;
  "Last Name": string;
  "Email": string;
  "Application Role": string;
  "AD Manager": string;
  "MS Excel": string;
  "Crystal Reports": string;
  "VPN Client access needed from outside the office?": string;
  "Test Ts Power On": string;
  "Position": string;
  "PM / EHR Use": string;
}

export const uploadCsv = withServerActionAuth(
  async function uploadCsv(formData: FormData, session: Session) {
    const file = formData.get("file") as File

    if (!file) {
      throw new Error("No file uploaded")
    }

    const bytes = await file.arrayBuffer()
    const text = new TextDecoder().decode(bytes)
    const normalizedText = text.replace(/\r\n/g, "\n").replace(/^\uFEFF/, "")
    // Now parse CSV text
    const records = parse(normalizedText, {
      columns: true, // if you want headers
      skip_empty_lines: true,
      trim: true,
    })

    // Remove rows where all fields are empty
    const filteredRecords = records.filter((record: any) => {
      return Object.values(record).some(
        (value) => value?.toString().trim() !== ""
      )
    })

    await bulkImportUsertoOrganization(filteredRecords, session)
    return success(undefined)
  },
  {
    role: ADMIN_ROLES,
  }
)

const getUserToImportFromCSV = async (Users: CsvUser[], session: Session): Promise<CsvUser[]> => {
  // Get all members in organization
  try {
    const { data: members = [] } = await managementClient.organizations.getMembers({
      id: session.user.org_id,
    });

    const userToImport: CsvUser[] = [];

    for (const user of Users) {
      const existingMember = members.find(member => member.email === user.Email);
      if (!existingMember) {
        userToImport.push(user);
      }
    }

    return userToImport;
  } catch (error) {
    console.error("Error fetching organization members:", error);
    return []; // Return empty array on error to satisfy return type
  }
}

const importUsertoOrganization = async (user: CsvUser, org_id: string, connection: string, session: Session) => {
  // Create user in Auth0
  const { data: createdUser } = await managementClient.users.create({
    email: user.Email,
    username: user.Username,
    given_name: user['First Name'],
    family_name: user['Last Name'],
    name: user['Display Name'],
    connection: connection,
    password: Math.random().toString(36).slice(-8), // Generate random password
    email_verified: false,
    app_metadata: {
      "Application Role": user['Application Role'],
      "AD Manager": user['AD Manager'],
      "MS Excel": user['MS Excel'],
      "Crystal Reports": user['Crystal Reports'],
      "VPN Client access needed from outside the office?": user['VPN Client access needed from outside the office?'],
      "Test Ts Power On": user['Test Ts Power On'],
      "Position": user['Position'],
      "PM / EHR Use": user['PM / EHR Use'],
    },
  });

  // Add to Organization
  await managementClient.organizations.addMembers(
    {
      id: org_id,
    },
    {
      members: [createdUser.user_id],
    }
  )
  // Assign role 
  await managementClient.organizations.addMemberRoles(
    {
      id: org_id,
      user_id: createdUser.user_id,
    },
    {
      roles: [config.auth0.role.memberId],
    }
  )

  // Send reset email
  await sendPasswordResetLink(user.Email, session)

  return user.Email

}

const bulkImportUsertoOrganization = async (Users: CsvUser[], session: Session) => {
  try {
    const userToImport = await getUserToImportFromCSV(Users, session);
    if (!userToImport.length) {
      return [];
    }

    const org_id = session.user.org_id;
    const CUSTOM_CLAIM_KEY = `${config.auth0.customNamespace}identities`;
    const provider = session?.user[CUSTOM_CLAIM_KEY].find((identity: any) => identity.provider === 'auth0');

    const results: {
      user: CsvUser;
      status: 'fulfilled' | 'rejected';
      reason?: any;
      value?: any;
    }[] = [];

    // Process users in batches
    for (let i = 0; i < userToImport.length; i += BATCH_SIZE) {
      const batch = userToImport.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.allSettled(
        batch.map(user => importUsertoOrganization(user, org_id, provider.connection, session))
      );

      // Map results to include user information
      results.push(...batchResults.map((result, idx) => ({
        user: batch[idx],
        status: result.status,
        ...(result.status === 'fulfilled' ? { value: result.value } : { reason: result.reason })
      })));
    }

    return results;
  } catch (error) {
    return handleError("bulk import users", error);
  }
}

