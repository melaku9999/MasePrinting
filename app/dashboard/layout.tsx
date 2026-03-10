"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { checkAuth, logout, type User } from "@/lib/auth"
import { DashboardShell } from "@/components/dashboards/dashboard-shell"
import { UserProvider } from "@/components/providers/user-provider"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const activeUser = await checkAuth()
        if (activeUser) {
          setUser(activeUser)
        } else {
          router.replace("/login")
        }
      } catch (error) {
        console.error("Auth verification failed:", error)
        router.replace("/login")
      } finally {
        setIsInitializing(false)
      }
    }
    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-xl" />
          <p className="text-muted-foreground animate-bounce">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <UserProvider initialUser={user}>
      <DashboardShell user={user} onLogout={handleLogout}>
        {children}
      </DashboardShell>
    </UserProvider>
  )
}
