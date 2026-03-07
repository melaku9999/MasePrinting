"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { login, type User } from "@/lib/auth"
import { Loader2, ShieldCheck, Mail, Lock } from "lucide-react"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log('Login attempt with identifier:', identifier);
      const user = await login(identifier, password)
      console.log('Login response:', user);

      if (user) {
        onLogin(user)
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch (err) {
      console.error('Login error:', err)
      setError("An error occurred during sign in. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fb] p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg mb-2">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">MasePrinting</h1>
          <p className="text-sm text-muted-foreground">Management System Access</p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-black/5 bg-white border-none">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Username or Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    required
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus-visible:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
                  <Button variant="link" className="px-0 font-normal text-xs text-muted-foreground hover:text-primary h-auto py-0">
                    Forgot password?
                  </Button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="pl-10 h-11 bg-muted/30 border-border/50 focus-visible:ring-primary/20 transition-all"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11 font-medium text-sm shadow-md" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In to Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t border-border/50 pt-4 pb-4 bg-muted/5 rounded-b-lg">
            {/* <div className="text-[11px] text-muted-foreground space-y-1 w-full">
              <p className="font-semibold uppercase tracking-[0.05em] mb-1.5 opacity-70">Demo Credentials</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="flex justify-between border-b border-border/40 pb-0.5">
                  <span>Admin:</span>
                  <span className="font-medium text-foreground/80">melaku</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-0.5">
                  <span>Employee:</span>
                  <span className="font-medium text-foreground/80">jo</span>
                </div>
                <div className="flex justify-between border-b border-border/40 pb-0.5 col-span-2">
                  <span>Demo Password:</span>
                  <span className="font-medium text-foreground/80 uppercase tracking-widest text-[10px]">mimi@2025</span>
                </div>
              </div>
            </div> */}
          </CardFooter>
        </Card>

        <div className="text-center">
            <p className="text-xs text-muted-foreground opacity-60">
                Secure access powered by Maseprinting
            </p>
        </div>
      </div>
    </div>
  )
}
