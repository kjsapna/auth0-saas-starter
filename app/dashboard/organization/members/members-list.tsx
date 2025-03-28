"use client"

import { DotsVerticalIcon, TrashIcon  } from "@radix-ui/react-icons"
import { toast } from "sonner"

import { Role } from "@/lib/roles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { blockMember, removeMember, updateRole,passwordResetLink,addGrouptoUser } from "./actions"
import { BanIcon, BotIcon, LockIcon } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"

interface Props {
  members: {
    id: string
    name: string
    email: string
    picture: string
    role: Role,
    blocked:boolean,
    groups: string[]
  }[]
  availableGroups: string[]
}

export function MembersList({ members,availableGroups=[]}: Props) {

  console.log(members);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Members</CardTitle>
        <CardDescription>The current organization members.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>AD Group</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={member.picture} />
                      <AvatarFallback>
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {member.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={member.role}
                    onValueChange={async (role: Role) => {
                      const { error } = await updateRole(member.id, role)
                      if (error) {
                        return toast.error(error)
                      }

                      toast.success("The member's role has been updated.")
                    }}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <MultiSelect
                    options={(availableGroups || []).map((group) => ({
                      value: group,
                      label: group,
                    }))}
                    defaultValue={member.groups || []}
                    onValueChange={async (selectedGroups) => {
                      const { error } = await addGrouptoUser(
                        member.id,
                        selectedGroups
                      )
                      if (error) {
                        return toast.error(error)
                      }
                      toast.success("Member's groups have been updated.")
                    }}
                    placeholder="Select groups"
                    className="w-[200px]"
                  />
                </TableCell>
                <TableCell className="flex justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="outline">
                        <DotsVerticalIcon className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        className="text-destructive"
                        onSelect={async () => {
                          const { error } = await passwordResetLink(member.id,member.email)
                          if (error) {
                            return toast.error(error)
                          }
                          toast.success(`Password reset link has been sent to member: ${member.email}. Please check your email`)
                         
                        }}
                      >
                        <LockIcon className="mr-1 size-4" />
                        Reset Password 
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={async () => {
                          const { error } = await removeMember(member.id)
                          if (error) {
                            return toast.error(error)
                          }

                          toast.success(`Removed member: ${member.email}`)
                        }}
                      >
                        <TrashIcon className="mr-1 size-4" />
                        Delete
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onSelect={async () => {
                          const { error } = await blockMember(member.id,member.blocked)
                          if (error) {
                            return toast.error(error)
                          }

                          const message = member.blocked ? 'Memeber ':'Block'

                          toast.success(`Member: ${member.email} has been ${!member.blocked ? 'Blocked ':'UnBlocked'}`)
                        }}
                      >
                        <BanIcon className="mr-1 size-4" />
                        {member.blocked ? 'UnBlock':'Block'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
