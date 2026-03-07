"use client"

import { LoginForm } from "@/components/auth/login-form"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/auth"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // If already logged in, go to dashboard
    const user = getCurrentUser()
    if (user) {
      router.push("/dashboard")
    } else {
      setLoading(false)
    }
  }, [router])

  const handleLoginSuccess = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-xl" />
          <p className="text-muted-foreground animate-bounce">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <LoginForm onLogin={handleLoginSuccess} />
}
