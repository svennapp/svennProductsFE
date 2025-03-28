import { Metadata } from "next"
import { GalleryVerticalEnd } from "lucide-react"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login - Svenn",
  description: "Login to your Svenn account",
}

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="/" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Svenn
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
