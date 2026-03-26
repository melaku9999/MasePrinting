"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { login, type User } from "@/lib/auth"
import { Loader2, ShieldCheck, Mail, Lock } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoginFormProps {
  onLogin: (user: User) => void
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDivaLounge, setIsDivaLounge] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      console.log('Login attempt:', identifier, isDivaLounge ? 'Diva mode' : 'Mase mode');
      const user = await login(identifier, password)
      
      if (user) {
        // Store the business context
        localStorage.setItem('business_context', isDivaLounge ? 'fnb' : 'printing')
        onLogin(user)
      } else {
        setError("Invalid credentials. Please try again.")
      }
    } catch (err) {
      setError("An error occurred during sign in. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn(
      "min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500",
      isDivaLounge ? "bg-[#0a0a0b]" : "bg-[#f8f9fb]"
    )}>
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-700">
        <div className="text-center space-y-3">
          <div className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg mb-2 transition-all duration-500",
            isDivaLounge ? "bg-amber-500 text-black rotate-45" : "bg-primary text-primary-foreground"
          )}>
            <ShieldCheck className={cn("h-7 w-7 transition-all", isDivaLounge ? "-rotate-45" : "")} />
          </div>
          <h1 className={cn(
            "text-3xl font-black tracking-tight transition-colors duration-500",
            isDivaLounge ? "text-white" : "text-foreground"
          )}>
            {isDivaLounge ? "Diva Lounge Addis" : "MasePrinting"}
          </h1>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">
            {isDivaLounge ? "Luxury Experience Management" : "Professional Management System"}
          </p>
        </div>

        <Card className={cn(
          "border-none shadow-2xl transition-all duration-500",
          isDivaLounge ? "bg-zinc-900/50 text-white backdrop-blur-xl border border-white/5" : "bg-white text-foreground"
        )}>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription className={isDivaLounge ? "text-zinc-400" : ""}>
              Please enter your details to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className={cn(
                  "text-[10px] font-bold uppercase tracking-widest opacity-70",
                  isDivaLounge ? "text-amber-500/80" : "text-primary"
                )}>
                  Username or Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="manager@divalounge.com"
                    required
                    className={cn(
                      "pl-10 h-12 transition-all",
                      isDivaLounge 
                        ? "bg-white/5 border-white/10 focus:border-amber-500/50 text-white placeholder:text-zinc-600" 
                        : "bg-muted/30 border-border/50 focus:border-primary/50"
                    )}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className={cn(
                    "text-[10px] font-bold uppercase tracking-widest opacity-70",
                    isDivaLounge ? "text-amber-500/80" : "text-primary"
                  )}>
                    Password
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={cn(
                      "pl-10 h-12 transition-all",
                      isDivaLounge 
                        ? "bg-white/5 border-white/10 focus:border-amber-500/50 text-white placeholder:text-zinc-600" 
                        : "bg-muted/30 border-border/50 focus:border-primary/50"
                    )}
                    disabled={isLoading}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold animate-in slide-in-from-top-2 duration-300">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-12 font-bold text-sm shadow-xl transition-all active:scale-[0.98]",
                  isDivaLounge ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-primary hover:bg-primary/90"
                )} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Access Dashboard"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 pb-6 bg-black/10 rounded-b-xl">
             <Button 
                variant="ghost" 
                onClick={() => setIsDivaLounge(!isDivaLounge)}
                className={cn(
                  "w-full text-xs font-bold tracking-widest uppercase py-6 border-2 border-dashed transition-all hover:bg-transparent",
                  isDivaLounge 
                    ? "border-amber-500/20 text-amber-500 hover:border-amber-500/50" 
                    : "border-primary/20 text-primary hover:border-primary/50"
                )}
             >
                Switch to {isDivaLounge ? "MasePrinting" : "Diva Lounge Addis"}
             </Button>
          </CardFooter>
        </Card>

        <p className="text-center text-[10px] uppercase font-bold tracking-[0.2em] opacity-30 text-muted-foreground">
          System Core v5.2.0 • Advanced Agentic Coding
        </p>
      </div>
    </div>
  )
}
