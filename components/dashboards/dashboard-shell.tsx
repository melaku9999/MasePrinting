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
    <div className="flex flex-col h-full bg-card min-h-0 overflow-hidden">
      <div className={cn(
        "flex items-center h-16 border-b border-border/60 shrink-0",
        sidebarCollapsed && !isMobile ? "justify-center" : "px-4 gap-3"
      )}>
        {(!sidebarCollapsed || isMobile) && (
          <>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
              M
            </div>
            <div className="overflow-hidden flex-1">
              <h2 className="text-sm font-semibold text-foreground truncate leading-tight">Maseprinting</h2>
              <p className="text-[11px] text-muted-foreground truncate leading-tight">Management System</p>
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
                <p className="px-3 mb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              {sidebarCollapsed && !isMobile && <Separator className="my-1 mx-2" />}
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
                          ? "bg-primary/10 text-primary font-medium hover:bg-primary/15"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted",
                        sidebarCollapsed && !isMobile && "justify-center px-0"
                      )}
                      onClick={() => handleNavigation(item.id)}
                    >
                      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
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
      <div className="border-t border-border/60 p-3 shrink-0">
        <div className={cn("flex items-center gap-3", sidebarCollapsed && !isMobile && "justify-center")}>
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {(!sidebarCollapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">@{user.username} • {user.role.charAt(0).toUpperCase() + user.role.slice(1)}</p>
            </div>
          )}
        </div>
        {(!sidebarCollapsed || isMobile) && (
          <div className="mt-2 flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 h-8 text-muted-foreground hover:text-foreground text-xs">
              <Settings className="h-3.5 w-3.5" />
              Settings
            </Button>
            <Button variant="ghost" size="sm" className="flex-1 justify-start gap-2 h-8 text-muted-foreground hover:text-destructive text-xs" onClick={onLogout}>
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
      <div className="h-screen bg-background flex overflow-hidden">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "bg-card border-r border-border/60 transition-all duration-300 flex flex-col h-full shadow-sm shrink-0",
              sidebarCollapsed ? "w-[60px]" : "w-[250px]"
            )}
          >
            {sidebarContent}
          </aside>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border/60 h-16 sticky top-0 z-40 shadow-sm shrink-0">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[250px] border-none">
                      {sidebarContent}
                    </SheetContent>
                  </Sheet>
                )}
                <h1 className="text-lg font-semibold capitalize">{activeTab.replace(/_/g, ' ')}</h1>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-card" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 px-2 gap-2 hover:bg-muted/50 rounded-lg">
                      <Avatar className="h-7 w-7 border border-border/60">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto bg-muted/20">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
