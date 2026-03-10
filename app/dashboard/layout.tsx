"use client"

import { useState, useEffect } from "react"
import { checkAuth, logout, type User } from "@/lib/auth"
import { useRouter, useParams } from "next/navigation"
import { UnifiedShell } from "@/components/dashboards/unified-shell"
import { adminNavigation, employeeNavigation, customerNavigation } from "@/lib/navigation"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const router = useRouter()
  const params = useParams()

  // Extract active tab from slug
  const slug = params?.slug as string[] | undefined
  const activeTab = slug?.[0] || "overview"

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
        router.replace("/login")
      } finally {
        setIsInitializing(false)
      }
    }
    verifyAuth()
  }, [router])

  const handleLogout = async () => {
    await logout()
    router.replace("/login")
  }

  const handleTabChange = (newTab: string) => {
    router.push(`/dashboard/${newTab}`)
  }

  if (isInitializing) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-xl" />
          <p className="text-muted-foreground animate-bounce">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  // Determine navigation based on role
  let navConfig = adminNavigation
  if (user.role === "employee") navConfig = employeeNavigation
  if (user.role === "customer") navConfig = customerNavigation

  return (
    <UnifiedShell
      user={user}
      onLogout={handleLogout}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      navigationGroups={navConfig}
    >
      {children}
    </UnifiedShell>
  )
}
