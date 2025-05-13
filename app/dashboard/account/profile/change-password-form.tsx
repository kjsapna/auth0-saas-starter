"use client"

import { SubmitButton } from "@/components/submit-button"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { redirect } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { changePassword } from "./actions"

interface Props {
   readonly userId: string
  }
export function ChangePasswordForm({userId}:Props) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [passwordError, setPasswordError] = useState("");
  
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
 
  
      const { error } = await changePassword(userId, password);
  
      if (error) {
        toast.error(error);
      } else {
        toast.success("Your password has been changed successfully.");
        setPassword("");
        setConfirmPassword("");
        setIsOpen(false);
       redirect("/api/auth/login")
      }
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
        if (password !== e.target.value) {
          setPasswordError("Passwords do not match");
        } else {
          setPasswordError("");
        }
      };
  
    return (
        <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div  className="space-y-2">
            <CardTitle>Change Password</CardTitle>
            <CardDescription>
              Once you change it, you  will not be able to log in using your previous password.
            </CardDescription>
          </div>
          
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsOpen(true)} variant="destructive">Change Password</Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-lg font-bold">Change Password</h2>
                <p className="text-sm text-gray-600">Update your new password.</p>
                <div>
                  <label htmlFor="password"className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="confirmpassword"className="block text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="flex justify-between">
                  <SubmitButton type="button">Cancel</SubmitButton>
                  <SubmitButton type="submit" variant="destructive">Save</SubmitButton>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
      </Card>
      );
  }
  