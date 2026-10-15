import { ShoppingBagIcon } from "lucide-react"
import { Suspense } from "react"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { CartLink } from "./cart-link"
import { HeaderSearch } from "./header-search"
import { LocationMenu } from "./location-menu"
import { ThemeToggle } from "./theme-toggle"
import { UserMenu } from "./user-menu"

/** Same footprint as the search box, shown until the URL-driven search streams in. */
function SearchPlaceholder({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="h-10 rounded-full bg-muted/60" />
    </div>
  )
}

/** Same footprint as the cart button, shown until the URL-driven link streams in. */
function CartLinkPlaceholder() {
  return (
    <Button
      variant="ghost"
      size="icon-lg"
      className="relative"
      aria-label="Ugrás a kosárhoz"
      disabled
    >
      <ShoppingBagIcon />
    </Button>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Brand className="shrink-0" />
        {/* The search reads the URL (request-time data), so it streams in. */}
        <Suspense
          fallback={<SearchPlaceholder className="hidden flex-1 sm:block sm:max-w-md" />}
        >
          <HeaderSearch className="hidden flex-1 sm:block sm:max-w-md" />
        </Suspense>
        <div className="ml-auto flex shrink-0 items-center gap-2">
          <LocationMenu />
          <UserMenu />
          {/* The cart link reads the URL (request-time data), so it streams in. */}
          <Suspense fallback={<CartLinkPlaceholder />}>
            <CartLink />
          </Suspense>
          <ThemeToggle />
        </div>
      </div>
      {/* Phones: the search gets its own full-width row. */}
      <div className="px-4 pb-3 sm:hidden">
        <Suspense fallback={<SearchPlaceholder />}>
          <HeaderSearch />
        </Suspense>
      </div>
    </header>
  )
}
