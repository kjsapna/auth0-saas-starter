"use client"

import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useState } from "react";
import { updateDisplayName } from "./actions";

interface UserProfile {
  phone_number?: string
  given_name?: string
  family_name?: string
  nickname?: string
  username?: string
  email?:string
  user_metadata?:{
    phoneNumber?:string
  }
}
interface Props {
  readonly displayName: string
  readonly userProfile?: UserProfile
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


export function DisplayNameForm({ displayName, userProfile }: Props) {
  const [email, setEmail] = useState(userProfile?.email ?? "");
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


  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          const {error} = await updateDisplayName(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success("Your profile  has been updated.")
          }
        }}
      >
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>
           
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="display_name">
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="text"
              defaultValue={userProfile?.email ?? ""}
              onChange={handleEmailChange}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p> 
            )}
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="given_name">Given Name</Label>
            <Input
              id="given_name"
              name="given_name"
              type="text"
              placeholder="John"
              defaultValue={userProfile?.given_name ?? ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="family_name">Family Name</Label>
            <Input
              id="family_name"
              name="family_name"
              type="text"
              placeholder="Smith"
              defaultValue={userProfile?.family_name ?? ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="johnsmith"
              defaultValue={userProfile?.username ?? ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="phone_number">Phone Number</Label>
            <Input
              id="phone_number"
              name="phone_number"
              type="tel"
              placeholder="+15551234567"
              defaultValue={userProfile?.user_metadata?.phoneNumber ?? ""}
            />
          </div>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="nickname">Nickname</Label>
            <Input
              id="nickname"
              name="nickname"
              type="text"
              placeholder="Johnny"
              defaultValue={userProfile?.nickname ?? ""}
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
