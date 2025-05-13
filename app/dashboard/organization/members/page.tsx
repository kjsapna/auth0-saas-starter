import { PageHeader } from "@/components/page-header"
import { config } from "@/config"
import { auth0Client, managementClient } from "@/lib/auth0"
import { PATHS, ROLES } from "@/lib/constants"
import { getRole, Role } from "@/lib/roles"
import { redirect } from "next/navigation"
import { CreateInvitationForm } from "./create-invitation-form"
import { IdPUsersInvitationList } from "./idp-invitation-form"
import { InvitationsList } from "./invitations-list"
import { MembersList } from "./members-list"


export default async function Members() {
  const session = await auth0Client.getSession()

  // if the user is not authenticated, redirect to login
  if (!session?.user) {
    redirect(PATHS.AUTH.LOGIN)
  }

  const isNGEAdmin = getRole(session.user) === ROLES.NGEADMIN;

  const { data: members } = await managementClient.organizations.getMembers({
    id: session.user.org_id,
    fields: ["user_id", "name", "email", "picture", "roles",].join(","),
    include_fields: true,
  })

  const { data: organization } = await managementClient.organizations.get({
    id: session.user.org_id,
  });

  const { data: connection } = await managementClient.organizations.getEnabledConnections({
    id: session.user.org_id,
  });

  const idpConnection = connection.find(
    (conn) => conn.connection.strategy !== 'auth0'
  );
  const hasIdPConnection = !!idpConnection;
  let inviteUsers: any = [];
  let filteredIdpUsers: any = []

  const { data: invitations } =
    await managementClient.organizations.getInvitations({
      id: session!.user.org_id,
    })

  if (hasIdPConnection) {
    // Fetch IdP users using the IdP connection
    const { data: idpUsers } = await managementClient.users.getAll({
      q: `identities.connection:"${idpConnection.connection.name}"`,
      fields: ["user_id", "name", "email", "picture", "roles", "identities"].join(","),
      include_fields: true,
      search_engine: "v3",
    });

    const { data: otherUsers } = await managementClient.users.getAll({
      q: `NOT identities.connection:"${idpConnection.connection.name}"`,
      fields: "email",
      include_fields: true,
      search_engine: "v3",
    });


    idpUsers.forEach((user: any) => {
      if (!otherUsers.some(obj => obj.email === user.email)) {
        inviteUsers.push(user);
      }

    })

    
    if(inviteUsers.length > 0){
       filteredIdpUsers = inviteUsers.filter(
        (user: { email: string }) => !invitations.some(invite => invite.invitee.email === user.email)
      );
    }   
  }

  const membersWithStatus = await Promise.all(
    members.map(async (member) => {
      const user = await managementClient.users.get({ id: member.user_id });

      return {
        ...member,
        blocked: user.data.blocked ?? false,
        groups: user.data.user_metadata?.AD_Group ?? []
      };
    })
  );
  const availableGroups = Array.isArray(organization.metadata?.AD_Group?.split(','))
    ? organization.metadata?.AD_Group?.split(',')
    : [];

    
  return (
    <div className="space-y-2">
      <PageHeader
        title="Members"
        description="Manage the members of the organization."
      />

      <MembersList
        members={membersWithStatus.map((m) => ({
          id: m.user_id,
          name: m.name,
          email: m.email,
          picture: m.picture,
          role: ((m.roles && m.roles[0]?.name) || "member") as Role,
          blocked: m.blocked,
          groups: m.groups
        }))}
        // roles={roles}
        availableGroups={availableGroups}
        isNGEAdmin={isNGEAdmin}


      />

      <InvitationsList
        invitations={invitations.map((i) => ({
          id: i.id,
          inviter: {
            name: i.inviter.name,
          },
          invitee: {
            email: i.invitee.email,
          },
          role:
            i.roles &&
              i.roles[0] &&
              i.roles[0] === config.auth0.role.adminId
              ? "admin"
              : "member",
          url: i.invitation_url,
        }))}
      />
      {hasIdPConnection ? (
        <IdPUsersInvitationList
          idpUsers={filteredIdpUsers}
          organizationId={session!.user.org_id}
        />
      ) : (
        <CreateInvitationForm />
      )}

    </div>
  )
}
