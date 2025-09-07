"use client"

import { useState } from "react"
import { ProfileManagement } from "@/components/profile/profile-management"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { mockUsers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function EmployeeProfilePage() {
  // Mock employee user - in real app, this would come from authentication context
  const [user, setUser] = useState<User>(
    mockUsers.find(u => u.role === "employee") || mockUsers[1]
  )

  const handleSave = (updatedUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
    // In real app, this would update the user in the backend
    console.log("User updated:", updatedUser)
  }

  const handleBack = () => {
    // Navigate back to employee dashboard
    window.history.back()
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <ProfileManagement 
        user={user}
        onBack={handleBack}
        onSave={handleSave}
        showBackButton={true}
      />
    </div>
  )
}