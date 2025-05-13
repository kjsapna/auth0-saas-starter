"use client"

import { useUser } from "@auth0/nextjs-auth0/client"
import slugify from "@sindresorhus/slugify"
import { useState } from "react"
import { toast } from "sonner"

import { Code } from "@/components/code"
import { SubmitButton } from "@/components/submit-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { createOrganization } from "./actions"

export function CreateOrganizationForm() {
  const { user } = useUser()
  const [name, setName] = useState("")
  const [adDomain, setAdDomain] = useState("")
  const [saUser, setSaUser] = useState("")
  const [saPassword, setSaPassword] = useState("")

  return (
    <form
      action={async (formData: FormData) => {
        const { error } = await createOrganization(formData)

        if (error) {
          toast.error(error)
        } else {
          toast.success("Your organization has been created.")
        }
      }}
    >
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            value={user?.email ?? ""}
            id="email"
            placeholder="name@example.com"
            type="email"
            disabled
            readOnly
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="organization_name">Organization Name</Label>
          <Input
            id="organization_name"
            name="organization_name"
            placeholder="Acme Corp"
            type="text"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Slug: <Code>{slugify(name || "Acme Corp")}</Code>
          </p>
        </div>
        <div>
          <Label>Configuration for Creating Connection</Label>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="ad_domain">AD Domain</Label>
          <Input
            id="ad_domain"
            name="ad_domain"
            placeholder="AD Domain"
            type="text"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            value={adDomain}
            onChange={(e) => setAdDomain(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sa_user">SA User</Label>
          <Input
            id="sa_user"
            name="sa_user"
            placeholder="SA User"
            type="text"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            value={saUser}
            onChange={(e) => setSaUser(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="sa_password">SA Password</Label>
          <Input
            id="sa_password"
            name="sa_password"
            placeholder="Password"
            type="password"
            autoCapitalize="none"
            autoComplete="new-password"
            autoCorrect="off"
            value={saPassword}
            onChange={(e) => setSaPassword(e.target.value)}
          />
        </div>
        <SubmitButton>Create Organization</SubmitButton>
      </div>
      
    </form>
  )
}
