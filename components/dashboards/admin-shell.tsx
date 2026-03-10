"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  Users,
  Building,
  CheckCircle2,
  Boxes,
  DollarSign,
  TrendingUp,
  LogOut,
  Settings,
  Bell,
  FolderOpen,
  UserCheck,
  Home,
  ChevronLeft,
  ChevronRight,
  Menu,
  MessageSquare,
  User,
  LineChart,
  Layout,
  CalendarDays,
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"

interface AdminShellProps {
  user: UserType
  onLogout: () => void
  activeTab: string
  onTabChange: (id: string) => void
  children: React.ReactNode
}

const navigationGroups = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: Home },
    ],
  },
  {
    label: "Inventory & Financials",
    items: [
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "financial", label: "Finances", icon: DollarSign },
      { id: "expenses", label: "Expenses", icon: TrendingUp },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "customers", label: "Customers", icon: Users },
      { id: "services", label: "Services", icon: Building },
      { id: "tasks", label: "Pending Tasks", icon: CheckCircle2 },
      { id: "mytasks", label: "My Tasks", icon: CheckCircle2 },
      { id: "calendar", label: "Calendar", icon: CalendarDays },
      { id: "boxfiles", label: "Box Files", icon: FolderOpen },
      { id: "employees", label: "Employees", icon: UserCheck },
      { id: "branches", label: "Branches", icon: Building },
    ],
  },
  {
    label: "Reports",
    items: [
      { id: "sales", label: "Sales Log", icon: DollarSign },
      { id: "revenue_hub", label: "Revenue Hub", icon: LineChart },
    ],
  },
  {
    label: "Communications",
    items: [
      { id: "content", label: "Content Editor", icon: Layout },
      { id: "inquiries", label: "Contact Inquiries", icon: MessageSquare },
    ],
  },
]

const allNavigationItems = navigationGroups.flatMap((g) => g.items)

export function AdminShell({ user, onLogout, activeTab, onTabChange, children }: AdminShellProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleNavigation = (id: string) => {
    onTabChange(id)
    setMobileSheetOpen(false)
  }

  const currentPageLabel = allNavigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/60 shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm shrink-0">
          M
        </div>
        {(!sidebarCollapsed || isMobile) && (
          <div className="overflow-hidden">
            <h2 className="text-sm font-semibold text-foreground truncate leading-tight">Maseprinting</h2>
            <p className="text-[11px] text-muted-foreground truncate leading-tight">Management System</p>
          </div>
        )}
        {!isMobile && (
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto h-7 w-7 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-4">
          {navigationGroups.map((group) => (
            <div key={group.label}>
              {(!sidebarCollapsed || isMobile) && (
                <p className="px-3 mb-1 text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  const NavButton = (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 h-9 px-3 font-normal",
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
                      <Tooltip key={item.id} delayDuration={0}>
                        <TooltipTrigger asChild>{NavButton}</TooltipTrigger>
                        <TooltipContent side="right">{item.label}</TooltipContent>
                      </Tooltip>
                    )
                  }
                  return NavButton
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
              <p className="text-[11px] text-muted-foreground truncate">@{user.username}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <div className="h-screen w-full flex overflow-hidden">
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "bg-card border-r border-border/60 transition-all duration-300 flex flex-col h-full shrink-0 shadow-sm",
              sidebarCollapsed ? "w-[60px]" : "w-[250px]"
            )}
          >
            {sidebarContent}
          </aside>
        )}

        <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
          {/* Header */}
          <header className="bg-card border-b border-border/60 h-16 shrink-0 z-40 shadow-sm">
            <div className="flex items-center justify-between h-full px-4 lg:px-6">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[250px] border-r-0">
                      {sidebarContent}
                    </SheetContent>
                  </Sheet>
                )}
                <div>
                  <h1 className="text-lg font-bold text-foreground truncate">{currentPageLabel}</h1>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">Admin Management Portal</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-red-500 rounded-full" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 px-2 hover:bg-muted">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive">
                      <LogOut className="h-4 w-4 mr-2" /> Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Persistent Content Area */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background/50">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
