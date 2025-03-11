import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
  import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui/card"  

interface Props {
  members: {
    id: string
    name: string
    email: string
    picture: string
  }[]
}  
export function MembersList({ members }: Props) {
   return ( <Card className="max-w-lg w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle>Current Members</CardTitle>
        <CardDescription className="text-xs">The current organization members.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User(s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="py-3">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.picture} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {member.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                
            
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
   )
}