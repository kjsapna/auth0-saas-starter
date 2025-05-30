"use client"

import { useRef, useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { createInvitation } from "./actions"

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function CreateInvitationForm() {
const [email, setEmail] = useState('');
const [emailError, setEmailError] = useState("");

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setEmail(value);
  if (value && !emailRegex.test(value)) {
    setEmailError("Please enter a valid email address");
  } else {
    setEmailError("");
  }
};
 const ref = useRef<HTMLFormElement>(null)

  return (
    <Card>
      <form
        ref={ref}
        action={async (formData: FormData) => {
          const { error } = await createInvitation(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success(`Invitation sent to ${formData.get("email")}`)
            ref.current?.reset()
          }
        }}
      >
        <CardHeader>
          <CardTitle>Invite team members</CardTitle>
          <CardDescription>
            Invite team members to join this organization using their email
            address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="jane@example.com"
                onChange={handleEmailChange}
                className={emailError ? "border-red-500" : ""}
              />
               {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p> 
            )}
            </div>

            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="role">Role</Label>
              <Select defaultValue="member" name="role">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Send</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
