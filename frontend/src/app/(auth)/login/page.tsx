import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"
import { AuthCard } from "@/components/auth/auth-card"
import { LoginForm } from "@/components/auth/login-form"
import { Highlighter } from "@/components/ui/highlighter"
import { Skeleton } from "@/components/ui/skeleton"

export const metadata: Metadata = { title: "Bejelentkezés" }

export default function LoginPage() {
  return (
    <div lang="hu" className="w-full">
      <AuthCard
        title="Üdv újra"
        description={
          <>
            Jelentkezz be, és{" "}
            <Highlighter action="underline" color="var(--primary)">
              rendelj a kedvenc éttermeidből
            </Highlighter>.
          </>
        }
        footer={
          <div className="flex flex-col gap-2">
            <p>
              Új vagy itt?{" "}
              <Link href="/register" className="font-medium text-primary hover:underline">
                Fiók létrehozása
              </Link>
            </p>
            <p className="text-xs">
              Demó fiók: <code>demo@example.com</code> / <code>Demo1234!</code>
            </p>
          </div>
        }
      >
        {/* The form reads `?next=` (a request-time value), so it streams in. */}
        <Suspense fallback={<FormSkeleton />}>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </div>
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
