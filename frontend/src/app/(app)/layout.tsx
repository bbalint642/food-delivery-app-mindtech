import type { ReactNode } from "react"
import { SiteHeader } from "@/components/layout/site-header"

/** Shell for pages that require a logged-in customer (guarded by proxy.ts). */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div lang="hu" className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  )
}
