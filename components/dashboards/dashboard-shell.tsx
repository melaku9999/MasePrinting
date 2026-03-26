"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Bell,
} from "lucide-react"
import type { User } from "@/lib/auth"
import { getNavigationForRole } from "@/lib/navigation"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"

interface DashboardShellProps {
  user: User
  onLogout: () => void
  children: React.ReactNode
}

export function DashboardShell({ user, onLogout, children }: DashboardShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Diva Lounge theme detection
  const isFnb = typeof window !== 'undefined' && localStorage.getItem('business_context') === 'fnb'

  // Extract active tab from pathname
  useEffect(() => {
    const segments = pathname.split("/")
    const tab = segments[segments.length - 1]
    if (tab && tab !== "dashboard") {
      setActiveTab(tab)
    } else {
      setActiveTab("overview")
    }
  }, [pathname])

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const navigationGroups = getNavigationForRole(user.role)

  const handleNavigation = (id: string) => {
    router.push(`/dashboard/${id}`)
  }

  const sidebarContent = (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", isFnb ? "bg-[#0a0a0b]" : "bg-card")}>
      <div className={cn(
        "flex items-center h-16 shrink-0",
        isFnb ? "border-b border-white/5" : "border-b border-border/60",
        sidebarCollapsed && !isMobile ? "justify-center" : "px-4 gap-3"
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <>
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg font-bold text-sm shrink-0",
              isFnb ? "bg-amber-500 text-black rotate-45" : "bg-primary text-primary-foreground"
            )}>
              <span className={isFnb ? "-rotate-45" : ""}>{isFnb ? "D" : "M"}</span>
            </div>
            <div className="overflow-hidden flex-1">
              <h2 className={cn("text-sm font-semibold truncate leading-tight", isFnb ? "text-white" : "text-foreground")}>{isFnb ? "Diva Lounge" : "Maseprinting"}</h2>
              <p className={cn("text-[11px] truncate leading-tight", isFnb ? "text-zinc-500" : "text-muted-foreground")}>{isFnb ? "Luxury Experience" : "Management System"}</p>
            </div>
          </>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={cn(
              "text-muted-foreground hover:text-foreground shrink-0",
              sidebarCollapsed ? "h-10 w-10" : "ml-auto h-7 w-7"
            )}
          >
            {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2 min-h-0">
        <nav className="px-2 space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              {(!sidebarCollapsed || isMobile) && (
                <p className={cn("px-3 mb-1 text-[11px] font-medium uppercase tracking-wider", isFnb ? "text-zinc-600" : "text-muted-foreground")}>
                  {group.label}
                </p>
              )}
              {sidebarCollapsed && !isMobile && <Separator className={cn("my-1 mx-2", isFnb && "bg-white/5")} />}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const button = (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 px-3 font-normal",
                        "transition-colors duration-150",
                        isActive
                          ? (isFnb ? "bg-amber-500/10 text-amber-500 font-medium hover:bg-amber-500/15" : "bg-primary/10 text-primary font-medium hover:bg-primary/15")
                          : (isFnb ? "text-zinc-400 hover:text-amber-400 hover:bg-white/5" : "text-muted-foreground hover:text-foreground hover:bg-muted"),
                        sidebarCollapsed && !isMobile && "justify-center px-0"
                      )}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && (isFnb ? "text-amber-500" : "text-primary"))} />
                      {(!sidebarCollapsed || isMobile) && (
                        <span className="truncate text-sm">{item.label}</span>
                      )}
                    </Button>
                  )

                  if (sidebarCollapsed && !isMobile) {
                    return (
                      <Tooltip key={item.id}>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right" className="font-normal">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    )
                  }

                  return button
                })}
              </div>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className={cn("p-3 shrink-0", isFnb ? "border-t border-white/5" : "border-t border-border/60")}>
        <div className={cn("flex items-center gap-3", sidebarCollapsed && !isMobile && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className={cn("text-xs font-semibold", isFnb ? "bg-amber-500/20 text-amber-500" : "bg-primary/10 text-primary")}>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className={cn("text-sm font-medium truncate", isFnb ? "text-white" : "text-foreground")}>{user.name}</p>
              <p className={cn("text-[11px] truncate", isFnb ? "text-zinc-500" : "text-muted-foreground")}>@{user.username} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          )}
        </div>
        {(!sidebarCollapsed || isMobile) && (
          <div className="mt-2 flex gap-1">
            <Button variant="ghost" size="sm" className={cn("flex-1 justify-start gap-2 h-8 text-xs", isFnb ? "text-zinc-500 hover:text-amber-400" : "text-muted-foreground hover:text-foreground")}>
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className={cn("flex-1 justify-start gap-2 h-8 text-xs", isFnb ? "text-zinc-500 hover:text-red-400" : "text-muted-foreground hover:text-destructive")} onClick={onLogout}>
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("h-screen flex overflow-hidden", isFnb ? "bg-[#0a0a0b]" : "bg-background")}>
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "transition-all duration-300 flex flex-col h-full shrink-0",
              isFnb ? "bg-[#0a0a0b] border-r border-white/5" : "bg-card border-r border-border/60 shadow-sm",
              sidebarCollapsed ? "w-[60px]" : "w-[250px]"
            )}
          >
            {sidebarContent}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className={cn(
            "h-16 sticky top-0 z-40 shrink-0",
            isFnb ? "bg-zinc-900/80 backdrop-blur-xl border-b border-white/5" : "bg-card border-b border-border/60 shadow-sm"
          )}>
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className={cn("h-9 w-9", isFnb && "text-zinc-400 hover:text-amber-400")}>
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className={cn("p-0 w-[250px] border-none", isFnb && "bg-[#0a0a0b]")}>
                      {sidebarContent}
                    </SheetContent>
                  </Sheet>
                )}
                <h1 className={cn("text-lg font-semibold capitalize", isFnb && "text-white")}>{activeTab.replace(/_/g, ' ')}</h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className={cn("h-9 w-9 relative", isFnb ? "text-zinc-400 hover:text-amber-400" : "text-muted-foreground")}>
                  <Bell className="h-4 w-4" />
                  <span className={cn("absolute top-2 right-2 w-2 h-2 rounded-full ring-2", isFnb ? "bg-amber-500 ring-zinc-900" : "bg-primary ring-card")} />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={cn("relative h-9 px-2 gap-2 rounded-lg", isFnb ? "hover:bg-white/5" : "hover:bg-muted/50")}>
                      <Avatar className={cn("h-7 w-7 border", isFnb ? "border-white/10" : "border-border/60")}>
                        <AvatarFallback className={cn("text-[10px] font-bold", isFnb ? "bg-amber-500/20 text-amber-500" : "bg-primary/10 text-primary")}>
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className={cn("text-sm font-medium hidden sm:inline", isFnb ? "text-white" : "text-foreground")}>{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={cn("w-48", isFnb && "bg-zinc-900 border-white/10 text-white")}>
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className={cn("text-xs", isFnb ? "text-zinc-500" : "text-muted-foreground")}>@{user.username}</p>
                    </div>
                    <DropdownMenuSeparator className={isFnb ? "bg-white/5" : ""} />
                    <DropdownMenuItem className={isFnb ? "focus:bg-white/5 focus:text-amber-400" : ""}>Profile</DropdownMenuItem>
                    <DropdownMenuItem className={isFnb ? "focus:bg-white/5 focus:text-amber-400" : ""}>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator className={isFnb ? "bg-white/5" : ""} />
                    <DropdownMenuItem onClick={onLogout} className={isFnb ? "text-red-400 focus:bg-red-500/10 focus:text-red-400" : "text-destructive"}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className={cn("flex-1 overflow-y-auto", isFnb ? "bg-[#0a0a0b]" : "bg-muted/20")}>
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
