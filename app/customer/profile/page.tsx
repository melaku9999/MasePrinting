"use client"

import { useState } from "react"
import { ProfileManagement } from "@/components/profile/profile-management"
import { mockUsers, mockCustomers } from "@/lib/auth"
import type { User } from "@/lib/auth"

export default function CustomerProfilePage() {
  // Mock customer user - in real app, this would come from authentication context
  const [user, setUser] = useState<User>(
    mockUsers.find(u => u.role === "customer") || mockUsers[2]
  )

  const handleSave = (updatedUser: Partial<User>) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
    // In real app, this would update the user in the backend
    console.log("User updated:", updatedUser)
  }

  const handleBack = () => {
    // Navigate back to customer dashboard
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