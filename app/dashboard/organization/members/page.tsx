import { appClient, managementClient } from "@/lib/auth0"
import { Role } from "@/lib/roles"
import { PageHeader } from "@/components/page-header"

import { CreateInvitationForm } from "./create-invitation-form"
import { InvitationsList } from "./invitations-list"
import { MembersList } from "./members-list"

export default async function Members() {
  const session = await appClient.getSession()
  const { data: members } = await managementClient.organizations.getMembers({
    id: session!.user.org_id,
    fields: ["user_id", "name", "email", "picture", "roles",].join(","),
    include_fields: true,
  })

  const { data: organization } = await managementClient.organizations.get({
    id: session!.user.org_id,
  });

  const { data:roles } = await managementClient.roles.getAll();

  const membersWithStatus = await Promise.all(
    members.map(async (member) => {
      const user = await managementClient.users.get({ id: member.user_id });
      
      return { ...member, 
        blocked: user.data.blocked ?? false,
        groups: user.data.user_metadata?.group || []
       };
    })
  );
  const availableGroups = Array.isArray(organization.metadata?.group?.split(',')) 
  ? organization.metadata?.group?.split(',') 
  : [];


  const { data: invitations } =
    await managementClient.organizations.getInvitations({
      id: session!.user.org_id,
    })

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
          blocked:m.blocked,
          groups: m.groups 
        }))}
        roles={roles}
        availableGroups={availableGroups}
        
      
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
            i.roles[0] === process.env.AUTH0_ADMIN_ROLE_ID
              ? "admin"
              : "member",
          url: i.invitation_url,
        }))}
      />

      <CreateInvitationForm />
    </div>
  )
}
