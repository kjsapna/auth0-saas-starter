"use client"

import { DotsVerticalIcon, TrashIcon } from "@radix-ui/react-icons"
import { toast } from "sonner"

import { Role } from "@/lib/roles"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

import { blockMember, removeMember, updateRole, passwordResetLink, addGrouptoUser, bulkPasswordResetLink } from "./actions"
import { BanIcon, BotIcon, LockIcon } from "lucide-react"
import { MultiSelect } from "@/components/ui/multi-select"
import { useEffect, useRef, useState } from "react"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import ReactPaginate from "react-paginate"

interface Props {
  members: {
    id: string
    name: string
    email: string
    picture: string
    role: Role,
    blocked: boolean,
    groups: string[]
  }[]
  // roles: { name: string, id: string, description: string }[]
  availableGroups: string[]
}

export function MembersList({ members,  availableGroups = [] }: Props) {


  const ref = useRef<HTMLFormElement>(null)
  const [memberPasswordResetList, setMemberPasswordResetList] = useState<
    string[]
  >([])
  const [search, setSearch] = useState<string>("")
  const [memberList, setMemberList] = useState(members)
  const [page, setPage] = useState<number>(0) // Current page (zero-based)
  const [pageCount, setPageCount] = useState<number>(0) // Total pages
  const [itemOffset, setItemOffset] = useState<number>(0) // Offset for pagination
  const itemsPerPage = 5 // Fixed items per page

  const updateMemberPasswordResetList = (checked: boolean, email: string) => {
    setMemberPasswordResetList((prev) => {
      if (checked) {
        if (!prev.includes(email)) {
          return [...prev, email] // only add if not already in the list
        }
      } else {
        return prev.filter((item) => item !== email)
      }
      return prev
    })
  }
  const selectAll = (checked: boolean) => {
    setMemberPasswordResetList(() => {
      if (checked) {
        return members.map((member) => member.email)
      } else {
        return []
      }
    })
  }

  const fetchMemberList = () => {
    let memberList = members;
    if (search !== "") {
      memberList = members.filter((m) => m.name.toLowerCase().includes(search))
    }

    setPageCount(Math.ceil(memberList.length / itemsPerPage))
    // Slice the data for the current page
    const endOffset = itemOffset + itemsPerPage
    setMemberList(memberList.slice(itemOffset, endOffset))
  }

  // Update displayed list when pagination changes
  useEffect(() => {
    if (members.length > 0) {
      const endOffset = itemOffset + itemsPerPage
      setMemberList(members.slice(itemOffset, endOffset))
      setPageCount(Math.ceil(members.length / itemsPerPage))
    }
  }, [itemOffset, members])

  // Handle search
  const handleSearch = () => {
    setPage(0) // Reset to first page
    setItemOffset(0) // Reset offset
    fetchMemberList()
  }

  // Handle page click from ReactPaginate
  const handlePageClick = (event: { selected: number }) => {
    const newOffset = event.selected * itemsPerPage
    setItemOffset(newOffset)
    setPage(event.selected)
  }

  return (
    <Card>
     
        <CardHeader>
          <CardTitle>Current Members</CardTitle>
          <CardDescription>The current organization members.</CardDescription>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="mt-2"
            />
            <Button onClick={handleSearch} className="mt-2">
              Search
            </Button>
          </div>
        </CardHeader>
         <form ref={ref} action={async (formData: FormData) => {
        const { error } = await bulkPasswordResetLink(memberPasswordResetList)
        if (error) {
          toast.error(error)
        } else {
          toast.success(`Invitation sent to All Selected Users`)
          ref.current?.reset()
        }
      }}>
        <CardContent>
          {memberPasswordResetList.length > 0 && <CardFooter className="flex justify-end">
            <SubmitButton>Send Password Reset Email</SubmitButton>
          </CardFooter>}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      selectAll(e.target.checked)
                    }}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>AD Group</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberList.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="pr-0">
                    <Input
                      type="checkbox"
                      className={
                        "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateMemberPasswordResetList(
                          e.target.checked,
                          member.email
                        )
                      }}
                      checked={memberPasswordResetList.includes(member.email)}
                    />
                    {/* {"Reset:" + member.last_password_reset} */}
                  </TableCell>
                  <TableCell className="w-full">
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
                        // const selectedRole = roles.find((r) => r.name === role);
                        // if (!selectedRole) {
                        //   toast.error("Selected role not found.");
                        //   return;
                        // }
                        //const { error } = await updateRole(member.id, selectedRole)
                        const { error } = await updateRole(member.id, role)
                        if (error) {
                          return toast.error(error)
                        }


                        toast.success("The member's role has been updated.")
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {/* {roles.map((role: { name: string }) => (<SelectItem value={role.name}>{role.name}</SelectItem>)
                    
                          )} */}
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
                      className="w-full"
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
                            const { error } = await passwordResetLink(member.id, member.email)
                            if (error) {
                              //return toast.error(error)
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
                            const { error } = await blockMember(member.id, member.blocked)
                            if (error) {
                              return toast.error(error)
                            }

                            const message = member.blocked ? 'Memeber ' : 'Block'

                            toast.success(`Member: ${member.email} has been ${!member.blocked ? 'Blocked ' : 'UnBlocked'}`)
                          }}
                        >
                          <BanIcon className="mr-1 size-4" />
                          {member.blocked ? 'UnBlock' : 'Block'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex items-center justify-between">
            {pageCount > 1 && (
              <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={1}
                pageRangeDisplayed={2}
                onPageChange={handlePageClick}
                forcePage={page} // Sync with current page
                breakClassName={"pagination-break"}
                breakLinkClassName={"pagination-break-link"}
                containerClassName={"pagination"}
                pageClassName={"pagination-page"}
                pageLinkClassName={"pagination-page-link"}
                previousClassName={"pagination-previous"}
                previousLinkClassName={"pagination-previous-link"}
                nextClassName={"pagination-next"}
                nextLinkClassName={"pagination-next-link"}
                activeClassName={"pagination-active"}
              />
            )}
            <span className="pagination-info">
              Page {page + 1} of {Math.max(pageCount, 1)}
            </span>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}
