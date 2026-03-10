"use client"

import { useParams, useRouter } from "next/navigation"
import { AdminDashboard } from "@/components/dashboards/admin-dashboard"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"
import { CustomerDashboard } from "@/components/dashboards/customer-dashboard"
import { useUser } from "@/components/providers/user-provider"
import { logout } from "@/lib/auth"

export default function DashboardPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()

  // Extract the slug/tab from the URL
  const slug = params?.slug as string[] | undefined
  const activeTab = slug?.[0] || "overview"

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
      return <AdminDashboard user={user} initialTab={activeTab} />
    case "employee":
      return <EmployeeDashboard user={user} initialTab={activeTab} />
    case "customer":
      return <CustomerDashboard user={user} initialTab={activeTab} />
    default:
      router.replace("/login")
      return null
  }
}
