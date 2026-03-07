"use client"

import { useState } from "react"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"
import { mockUsers, logout } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function EmployeePage() {
  // Mock employee user - in real app, this would come from authentication context
  const [user] = useState<User>(
    mockUsers.find(u => u.role === "employee") || mockUsers[1]
  )

  const handleLogout = async () => {
    console.log("Logging out...")
    await logout()
    window.location.href = '/login'
  }

  return (
    <EmployeeDashboard 
      user={user}
      onLogout={handleLogout}
    />
  )
}