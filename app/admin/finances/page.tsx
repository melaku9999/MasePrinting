"use client"

import { useState, useEffect } from "react"
import { FinancialManager } from "@/components/financial/financial-manager"
import { checkAuth, type User } from "@/lib/auth"

export default function FinancesPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const activeUser = await checkAuth()
        setUser(activeUser)
      } catch (error) {
        console.error("Auth verification failed", error)
      } finally {
        setLoading(false)
      }
    }
    verifyAuth()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.replace("/login")
    }
    return null
  }

  return (
    <div className="container mx-auto py-8">
      <FinancialManager user={user} />
    </div>
  )
}
