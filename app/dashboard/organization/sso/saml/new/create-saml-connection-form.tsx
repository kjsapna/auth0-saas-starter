"use client"

import { CopyIcon, InfoCircledIcon, TrashIcon } from "@radix-ui/react-icons"
import slugify from "@sindresorhus/slugify"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Code } from "@/components/code"
import { SubmitButton } from "@/components/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { AddDomainDialog } from "../../components/add-domain-dialog"
import { createConnection } from "./actions"



interface Props {
  domainVerificationToken: string
  publicUrl:string
}

export function CreateSamlConnectionForm({ domainVerificationToken,publicUrl }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [domains, setDomains] = useState<string[]>([])

  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          const { error } = await createConnection(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success("The connection has been created.")
            router.push("/dashboard/organization/sso")
          }
        }}
      >
        <CardHeader>
          <CardTitle>Create a SAML Connection</CardTitle>
          <CardDescription>
            Configure a new SAML connection for your organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="display_name">Connection Name</Label>
            <Input
              id="display_name"
              name="display_name"
              type="text"
              placeholder="Acme SAML"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Identifier: <Code>{slugify(name || "Acme SAML")}</Code>
            </p>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="sign_in_url">Sign In URL</Label>
            <Input
              id="sign_in_url"
              name="sign_in_url"
              type="url"
              placeholder="https://auth.example.com/login"
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="sign_out_url">Sign Out URL</Label>
            <Input
              id="sign_out_url"
              name="sign_out_url"
              type="url"
              placeholder="https://auth.example.com/logout"
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="certificate">X509 Signing Certificate</Label>
            <Input
              id="certificate"
              name="certificate"
              type="file"
              accept=".pem,.cer"
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="user_id_attribute">User ID Attribute</Label>
            <Input
              id="user_id_attribute"
              name="user_id_attribute"
              type="text"
              placeholder="http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
            />
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="protocol_binding">Protocol Binding</Label>
            <Select
              name="protocol_binding"
              defaultValue="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect"
            >
              <SelectTrigger id="protocol_binding">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect">
                  HTTP Redirect
                </SelectItem>
                <SelectItem value="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
                  HTTP POST
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="domains">Domains</Label>
            <Input
              id="domains"
              name="domains"
              type="text"
              className="hidden"
              value={domains.join(",")}
              readOnly
            />
            {domains.length > 0 ? (
              domains.map((domain) => (
                <div key={domain} className="flex space-x-2">
                  <Input className="font-mono" value={domain} readOnly />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setDomains(domains.filter((d) => d !== domain))
                      }}
                    >
                      <TrashIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                <p>No domains have been added yet.</p>
              </div>
            )}
            <div>
              <AddDomainDialog
                domains={domains}
                setDomains={setDomains}
                domainVerificationToken={domainVerificationToken}
              />
            </div>
          </div>

          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="sign_request">Sign Request</Label>
              <p className="text-sm text-muted-foreground">
                The request will be signed with <Code>RSA-SHA256</Code>.{" "}
                <a
                  className="underline underline-offset-4"
                  href={`https://${publicUrl}/pem?cert=connection`}
                  target="_blank"
                >
                  Download the certificate
                </a>{" "}
                to configure your identity provider to validate the request
                signature.
              </p>
            </div>
            <Switch id="sign_request" name="sign_request" />
          </div>

          <Alert>
            <InfoCircledIcon className="size-4" />
            <AlertTitle>Post-Back URL</AlertTitle>
            <AlertDescription>
              You will need to configure the SAML identity provider with the
              following post-back URL:
              <div className="mt-2 flex space-x-2">
                <Input className="font-mono" value={`${publicUrl}/login/callback`} readOnly />
                <Button size="icon" variant="outline" type="button">
                  <CopyIcon
                    className="size-4"
                    onClick={async () => {
                      await navigator.clipboard.writeText(`${publicUrl}/login/callback`)
                      toast.success("Post-back URL copied to clipboard.")
                    }}
                  />
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          <Separator />

          <div className="grid w-full items-center gap-2">
            <Label htmlFor="assign_membership_on_login">Auto-Membership</Label>
            <RadioGroup
              id="assign_membership_on_login"
              name="assign_membership_on_login"
              defaultValue="enabled"
              className="grid grid-cols-2 gap-2"
            >
              <div>
                <RadioGroupItem
                  value="enabled"
                  id="enable_auto_membership"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="enable_auto_membership"
                  className="flex h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="space-y-1.5">
                    <div>Enable Auto-Membership</div>
                    <div className="leading-normal text-muted-foreground">
                      All users logging in with this connection will be
                      automatically added as members of this organization.
                    </div>
                  </div>
                </Label>
              </div>

              <div>
                <RadioGroupItem
                  value="disabled"
                  id="disable_auto_membership"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="disable_auto_membership"
                  className="flex h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <div className="space-y-1.5">
                    <div>Disable Auto-Membership</div>
                    <div className="leading-normal text-muted-foreground">
                      All users logging in with this connection will not be
                      added as members to this organization.
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <SubmitButton>Create Connection</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
