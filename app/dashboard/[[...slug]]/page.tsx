"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"
import { CustomerDashboard } from "@/components/dashboards/customer-dashboard"
import { checkAuth, logout, type User } from "@/lib/auth"

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  // Extract the slug/tab from the URL
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

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-xl" />
          <p className="text-muted-foreground animate-bounce">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const handleTabChange = (newTab: string) => {
    router.push(`/dashboard/${newTab}`)
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} initialTab={activeTab} onTabChange={handleTabChange} />
    case "employee":
      return <EmployeeDashboard user={user} onLogout={handleLogout} initialTab={activeTab} onTabChange={handleTabChange} />
    case "customer":
      return <CustomerDashboard user={user} onLogout={handleLogout} initialTab={activeTab} onTabChange={handleTabChange} />
    default:
      return <LoginForm onLogin={setUser} />
  }
}
