"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AdminContent } from "@/components/dashboards/admin-content"
import { EmployeeContent } from "@/components/dashboards/employee-content"
import { CustomerContent } from "@/components/dashboards/customer-content"
import { checkAuth, type User } from "@/lib/auth"

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

  if (isInitializing) return null // Handled by layout.tsx loading state

  if (!user) return null

  // We only render the content part. The sidebar and header are in layout.tsx
  switch (user.role) {
    case "admin":
      return <AdminContent user={user} activeTab={activeTab} />
    case "employee":
      return <EmployeeContent user={user} activeTab={activeTab} />
    case "customer":
      return <CustomerContent user={user} activeTab={activeTab} />
    default:
      router.replace("/login")
      return null
  }
}
