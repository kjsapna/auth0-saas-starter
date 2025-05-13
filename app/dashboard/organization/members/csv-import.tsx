"use client"

import { useRef } from "react"
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

import { uploadCsv } from "./actions"

export const CSVImporter = () => {
  const ref = useRef<HTMLFormElement>(null)
  return (
    <Card>
      <form
        action={async (formData: FormData) => {
          const { error } = await uploadCsv(formData)

          if (error) {
            toast.error(error)
          } else {
            toast.success(`Users Imported successfully`)
            ref.current?.reset()
          }
        }}
        ref={ref}
      >
        <CardHeader>
          <CardTitle>Import Users from CSV</CardTitle>
          <CardDescription>
            Upload a CSV file to import users into your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <input type="file" name="file" accept=".csv" />
        </CardContent>

        <CardFooter className="flex justify-end">
          <SubmitButton>Import CSV</SubmitButton>
        </CardFooter>
      </form>
    </Card>
  )
}
