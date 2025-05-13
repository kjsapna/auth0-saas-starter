import { PageHeader } from "@/components/page-header"

import UserLogs from "./user-logs"


export default async function Logs() {
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
