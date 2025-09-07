"use client"

import { useState } from "react"
import { EmployeeDashboard } from "@/components/dashboards/employee-dashboard"
import { mockUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function EmployeePage() {
  // Mock employee user - in real app, this would come from authentication context
  const [user] = useState<User>(
    mockUsers.find(u => u.role === "employee") || mockUsers[1]
  )

  const handleLogout = () => {
    // Handle logout logic here
    console.log("Logging out...")
    // In a real app, this would clear the session and redirect to login
    window.location.href = '/'
  }

  return (
    <EmployeeDashboard 
      user={user}
      onLogout={handleLogout}
    />
  )
}