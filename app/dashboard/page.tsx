"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"
import { CustomerDashboard } from "@/components/dashboards/customer-dashboard"
import { checkAuth, getCurrentUser, logout, type User } from "@/lib/auth"

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const activeUser = await checkAuth()
        if (activeUser) {
          setUser(activeUser)
        } else {
          window.location.replace("/login")
        }
      } catch (error) {
        window.location.replace("/login")
      } finally {
        setIsInitializing(false)
      }
    }
    verifyAuth()
  }, [])

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

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/login"
    }
    return null
  }

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard user={user} onLogout={handleLogout} />
    case "employee":
      return <EmployeeDashboard user={user} onLogout={handleLogout} />
    case "customer":
      return <CustomerDashboard user={user} onLogout={handleLogout} />
    default:
      return <LoginForm onLogin={setUser} />
  }
}
