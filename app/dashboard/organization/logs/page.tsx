import { appClient, managementClient } from "@/lib/auth0"
import { PageHeader } from "@/components/page-header"
//import { UserLogs } from "./user-logs"
import UserLogs from "./user-logs"


export default async function Logs() {
  const session = await appClient.getSession()
  const { data: org } = await managementClient.organizations.get({
    id: session!.user.org_id,
  })

  return (
    <div className="space-y-2">
      <PageHeader
        title= "User Logs"
        description="List of user logs "
      />
         <UserLogs
              
              
            />
      
    </div>
  )
}
