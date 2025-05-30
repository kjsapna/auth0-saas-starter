import Image from "next/image";
import Link from "next/link";
import { CreateOrganizationForm } from "./create-organization-form";

export default async function Create() {
  return (
    <div className="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image className="mr-2 size-8"
              src="https://nextgen.widen.net/content/mcckjhwu0f/original/NG_Logo_Final_RGB.svg?u=yye1mp"
              alt="NextGen Logo"
              width={32}
              height={32}
          />
          <span className="font-mono font-medium">NextGen </span>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <div className="space-y-1">
            
              <p className="text-lg">
               NextGen Delegated Admin Console is application for managing user by Client Admin
              </p>
            </div>
            <footer className="text-sm text-muted-foreground">
                NextGen Client Dashbord
            </footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your organization name to create an account.
            </p>
          </div>
          <CreateOrganizationForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
