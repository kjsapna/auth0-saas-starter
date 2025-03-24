"use client"

import { useEffect, useState } from "react"
import ReactPaginate from "react-paginate"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { fetchUsers } from "./actions"

interface User {
  id: string
  name: string
  email: string
  last_login: string
  blocked: string
}

const UserLogs = () => {
  const [members, setMembers] = useState<User[]>([]) // All fetched users
  const [displayList, setDisplayList] = useState<User[]>([]) // Paginated subset
  const [search, setSearch] = useState<string>("")
  const [page, setPage] = useState<number>(0) // Current page (zero-based)
  const [pageCount, setPageCount] = useState<number>(0) // Total pages
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [itemOffset, setItemOffset] = useState<number>(0) // Offset for pagination
  const itemsPerPage = 5 // Fixed items per page

  const fetchUserData = async (query: string) => {
    setIsLoading(true)
    try {
      const queryParams = {
        page: 0, // For client-side pagination, we fetch all data and paginate locally
        query: query,
      }

      const { status, data } = await fetchUsers(queryParams)

      if (status === 200 && data.length > 0) {
        const users = data.map((m: any) => ({
          id: m.user_id,
          name: m.name,
          email: m.email,
          last_login: m.last_login,
          blocked: m?.blocked,
        }))
        setMembers(users)
        // Update pagination based on total items and items per page
        setPageCount(Math.ceil(users.length / itemsPerPage))
        // Slice the data for the current page
        const endOffset = itemOffset + itemsPerPage
        setDisplayList(users.slice(itemOffset, endOffset))
      } else {
        console.error("Unexpected data format:", data)
        setMembers([])
        setDisplayList([])
        setPageCount(0)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setMembers([])
      setDisplayList([])
      setPageCount(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Update displayed list when pagination changes
  useEffect(() => {
    if (members.length > 0) {
      const endOffset = itemOffset + itemsPerPage
      setDisplayList(members.slice(itemOffset, endOffset))
      setPageCount(Math.ceil(members.length / itemsPerPage))
    }
  }, [itemOffset, members])

  // Fetch data when search changes
  useEffect(() => {
    fetchUserData(search)
  }, [search])

  // Handle search
  const handleSearch = () => {
    setPage(0) // Reset to first page
    setItemOffset(0) // Reset offset
    fetchUserData(search)
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
        <CardTitle>User Logs</CardTitle>
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
        {isLoading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayList.length > 0 ? (
                  displayList.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.name || "N/A"}</TableCell>
                      <TableCell>{member.email || "N/A"}</TableCell>
                      <TableCell>{member.last_login || "Never"}</TableCell>
                      <TableCell>
                        {member?.blocked ? "Blocked" : "Active"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default UserLogs
