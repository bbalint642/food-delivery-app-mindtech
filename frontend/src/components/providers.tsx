"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ThemeProvider } from "next-themes"
import { useState, type ReactNode } from "react"
import { Toaster } from "@/components/ui/sonner"
import { ApiError } from "@/lib/api/errors"
import { AuthProvider, useAuth } from "@/lib/auth/auth-provider"
import { LocationProvider } from "@/lib/location/location-provider"

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        refetchOnWindowFocus: false,
        // Retrying client errors (4xx) is pointless; retry network/5xx once.
        retry: (failureCount, error) =>
          failureCount < 1 &&
          !(error instanceof ApiError && error.status >= 400 && error.status < 500),
      },
    },
  })
}

/** The location belongs to the signed-in user: it resets on logout or user switch. */
function UserScopedLocation({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return <LocationProvider key={user?.id ?? "guest"}>{children}</LocationProvider>
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserScopedLocation>{children}</UserScopedLocation>
        </AuthProvider>
        <Toaster richColors position="top-center" />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
