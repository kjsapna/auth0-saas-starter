"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { SubmitButton } from "@/components/submit-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import ReactPaginate from "react-paginate"
import { createInvitation, sendBulkIdPInvitation } from "./actions"

interface IdPUser {
  id: string;
  name: string;
  email: string;
}

interface IdPUsersInvitationListProps {
  idpUsers: IdPUser[];
  organizationId: string;
}

export function IdPUsersInvitationList({ idpUsers, organizationId }: IdPUsersInvitationListProps) {
  const ref = useRef<HTMLFormElement>(null)
  const [idPUsersInvitationList, setIdPUsersInvitationList] = useState<string[]>([])
  const [search, setSearch] = useState<string>("")
  const [idpUserList, setIdpUserList] = useState<IdPUser[]>(idpUsers)
  const [page, setPage] = useState<number>(0) // Current page (zero-based)
  const [pageCount, setPageCount] = useState<number>(0) // Total pages
  const [itemOffset, setItemOffset] = useState<number>(0) // Offset for pagination
  const itemsPerPage = 1 // Fixed items per page

  const updateIdpUserInvitationList = (checked: boolean, email: string) => {
    setIdPUsersInvitationList((prev) => {
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
    setIdPUsersInvitationList(() => {
      if (checked) {
        return idpUserList.map((idpUser: IdPUser) => idpUser.email)
      } else {
        return []
      }
    })
  }

  const fetchIdpUserList = () => {
    let idpUserList = idpUsers;
    if (search !== "") {
      idpUserList = idpUsers.filter((idpUser: IdPUser) => idpUser.name.toLowerCase().includes(search))
    }

    setPageCount(Math.ceil(idpUserList.length / itemsPerPage))
    // Slice the data for the current page
    const endOffset = itemOffset + itemsPerPage
    setIdpUserList(idpUserList.slice(itemOffset, endOffset))
  }

  // Update displayed list when pagination changes
  useEffect(() => {
    if (idpUsers.length > 0) {
      const endOffset = itemOffset + itemsPerPage
      setIdpUserList(idpUsers.slice(itemOffset, endOffset))
      setPageCount(Math.ceil(idpUsers.length / itemsPerPage))
    }
  }, [itemOffset, idpUsers])

  // Handle search
  const handleSearch = () => {
    setPage(0) // Reset to first page
    setItemOffset(0) // Reset offset
    fetchIdpUserList()
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
        <CardTitle>Invite IdP Users</CardTitle>
        <CardDescription>
          Invite users from the Identity Provider to join this organization.
        </CardDescription>
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
      <CardContent>
        {idpUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No eligible IdP users found to invite.
          </p>
        ) : (
          <form ref={ref} action={async (formData: FormData) => {
            
        const { error } = await sendBulkIdPInvitation(idPUsersInvitationList)
        if (error) {
          toast.error(error)
        } else {
          toast.success(`Invitation sent to All Selected IdP Users`)
          ref.current?.reset()
        }
      }}>
        {idPUsersInvitationList.length > 0 && <CardFooter className="flex justify-end">
            <SubmitButton>Send Invitation Email</SubmitButton>
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {idpUserList.map((user: IdPUser) => (
              <TableRow key={user.id}>
                <TableCell className="pr-0">
                    <Input
                      type="checkbox"
                      className={
                        "h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      }
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        updateIdpUserInvitationList(
                          e.target.checked,
                          user.email
                        )
                      }}
                      checked={idPUsersInvitationList.includes(user.email)}
                    />
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>
                    <Button type="button" 
                    onClick = { async () => {
                      const formData = new FormData();
                      formData.append("email", user.email); // Add email to FormData
                      formData.append("organizationId", organizationId); // Add organizationId
                      formData.append("role", 'member'); // Add organizationId
                      const { error } = await createInvitation(formData);
  
                      if (error) {
                        toast.error(error);
                      } else {
                        toast.success(`Invitation sent to ${user.email}`);
                       
                      }
                    }}
                    >Send</Button>
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
          </form>
)}
      </CardContent>
    </Card>
  )
}