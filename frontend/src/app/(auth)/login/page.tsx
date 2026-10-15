import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Log in" }

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome back"
      description="Log in to order from your favourite restaurants."
      footer={
        <div className="flex flex-col items-center gap-2">
          <p>
            New here?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </p>
          <p className="text-xs">
            Demo account: <code>demo@example.com</code> / <code>Demo1234!</code>
          </p>
        </div>
      }
    >
      {/* The form reads `?next=` (a request-time value), so it streams in. */}
      <Suspense fallback={<FormSkeleton />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  )
}

function FormSkeleton() {
  return (
    <div className="flex flex-col gap-7">
      <Skeleton className="h-14" />
      <Skeleton className="h-14" />
      <Skeleton className="h-10" />
    </div>
  )
}
