import { Brand } from "@/components/brand"
import { UserMenu } from "./user-menu"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Brand />
        <UserMenu />
      </div>
    </header>
  )
}
