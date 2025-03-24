"use client"

import { toast } from "sonner"

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
import { SubmitButton } from "@/components/submit-button"

import { updateDisplayName } from "./actions"

interface UserProfile {
  phone_number?: string
  given_name?: string
  family_name?: string
  nickname?: string
  username?: string
}
interface Props {
  displayName: string
  userProfile?: UserProfile
}

export function DisplayNameForm({ displayName, userProfile }: Props) {
  console.log(userProfile)
  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          const { error } = await updateDisplayName(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success("Your display name has been updated.")
          }
        }}
      >
        <CardHeader>
          <CardTitle>Display Name</CardTitle>
          <CardDescription>
            Enter a name you would liked to have displayed to other users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="display_name" className="sr-only">
              Display Name
            </Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="John Smith"
              defaultValue={displayName}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="given_name">Given Name</Label>
            <Input
              id="given_name"
              name="given_name"
              type="text"
              placeholder="John"
              defaultValue={userProfile?.given_name || ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="family_name">Family Name</Label>
            <Input
              id="family_name"
              name="family_name"
              type="text"
              placeholder="Smith"
              defaultValue={userProfile?.family_name || ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johnsmith"
              defaultValue={userProfile?.username || ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="+1 (555) 123-4567"
              defaultValue={userProfile?.phone_number || ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="Johnny"
              defaultValue={userProfile?.nickname || ""}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Save</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
