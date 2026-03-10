"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { type User } from "@/lib/auth"

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function UserProvider({ children, initialUser }: { children: React.ReactNode, initialUser?: User | null }) {
  const [user, setUser] = useState<User | null>(initialUser || null)

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
