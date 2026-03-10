"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import { BoxFileManagement } from "@/components/files/box-file-management"
import { ProfileManagement } from "@/components/profile/profile-management"
import { EmployeeManagement } from "@/components/employees/employee-management"
import { CustomerManagement } from "@/components/customers/customer-management"
import { SalesManagement } from "@/components/sales/sales-management"
import { FinancialManager, RevenueHub } from "@/components/financial"
import { SharedTaskInterface } from "@/components/tasks/shared-task-interface"
import { InventoryManager } from "@/components/inventory/inventory-manager"
import { ServiceMarketplace } from "@/components/services/service-marketplace"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  LogOut,
  Bell,
  Calendar,
  Search,
  Home,
  Folder,
  Settings,
  User,
  UserCheck,
  TrendingUp,
  Target,
  Menu,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ArrowUpRight,
  Users,
  ShoppingCart,
  DollarSign,
  LineChart,
  Boxes,
  Briefcase
} from "lucide-react"
import { employeesApi } from "@/lib/api"
import { mapBackendTaskToFrontend } from "@/lib/task-utils"
import { connectTaskSocket } from "@/lib/websocket"
import { toast } from "sonner"
import type { User as AuthUser } from "@/lib/auth"

interface EmployeeDashboardProps {
  user: AuthUser
  onLogout: () => void
  initialTab?: string
  onTabChange?: (tab: string) => void
}

interface Notification {
  id: string
  type: 'urgent' | 'warning' | 'success' | 'info'
  title: string
  message: string
  timestamp: Date
  read: boolean
  taskId?: string | null
}

const navigationGroups = [
  {
    label: "Main",
    items: [
      { id: "overview", label: "Overview", icon: Home },
      { id: "tasks", label: "My Tasks", icon: CheckCircle2 },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "services", label: "Services", icon: Briefcase },
    ],
  },
  {
    label: "Inventory & Financials",
    items: [
      { id: "sales", label: "Sales", icon: ShoppingCart },
      { id: "inventory", label: "Inventory", icon: Boxes },
      { id: "financial", label: "Finances", icon: DollarSign },
      { id: "revenue_hub", label: "Revenue Insights", icon: LineChart },
    ],
  },
  {
    label: "Management",
    items: [
      { id: "customers", label: "Customers", icon: Users },
      // { id: "employees", label: "Employees", icon: UserCheck },
      { id: "files", label: "Box Files", icon: Folder },
    ],
  },
]

const allNavigationItems = navigationGroups.flatMap((g) => g.items)

export function EmployeeDashboard({ user, onLogout, initialTab = "overview", onTabChange }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync activeTab when initialTab changes (e.g., via URL)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "urgent",
      title: "Urgent Task Assignment",
      message: "New high-priority customer onboarding task requires immediate attention",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      read: false,
      taskId: "task-123"
    },
    {
      id: "2",
      type: "info",
      title: "Task Completed",
      message: "Customer verification process has been completed successfully",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: true,
      taskId: "task-456"
    },
  ])
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  const fetchDashboardData = async () => {
    if (!user.employee_id) return
    setIsLoadingTasks(true)
    try {
      const response = await employeesApi.getTasks(user.employee_id.toString())
      const mapped = (response.results || []).map(mapBackendTaskToFrontend)
      setTasks(mapped)
    } catch (error) {
      console.error("Failed to fetch dashboard tasks:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) setSidebarCollapsed(true)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    fetchDashboardData()

    // Real-time synchronization
    const disconnect = connectTaskSocket((update) => {
      // Refresh tasks if this part of the dashboard needs it
      console.log('Real-time task update reaching employee portal:', update)
      fetchDashboardData()
      
      // Notify components to refresh
      window.dispatchEvent(new CustomEvent('refreshTasks'))
      
      // Notify only if it's relevant to this employee (if we have the worker ID)
      if (update.data.assigned_to === user.employee_id) {
        toast.success(`Task Update: ${update.data.title} is now ${update.data.status}`)
      }
    })

    return () => {
      window.removeEventListener('resize', checkMobile)
      disconnect()
    }
  }, [user.employee_id])

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const overdueTasks = tasks.filter((task) => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && task.status !== "completed"
  })

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleProfileSave = (updatedUser: Partial<AuthUser>) => {
    console.log("Profile updated:", updatedUser)
  }

  const currentPageLabel = allNavigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"

  const NavItem = ({ item }: { item: any }) => {
    const isActive = activeTab === item.id
    const Icon = item.icon

    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Button
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start transition-all duration-200",
              sidebarCollapsed ? "px-2" : "px-3",
              isActive ? "bg-primary/5 text-primary hover:bg-primary/10" : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => {
              setActiveTab(item.id)
              if (onTabChange) {
                onTabChange(item.id)
              }
            }}
          >
            <Icon className={cn("h-4 w-4 shrink-0", !sidebarCollapsed && "mr-3")} />
            {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
            {!sidebarCollapsed && isActive && (
              <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
            )}
          </Button>
        </TooltipTrigger>
        {sidebarCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
      </Tooltip>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      {!isMobile && (
        <div className="p-6 border-b flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Target className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">Portal</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="h-8 w-8"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      )}

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-6">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2">
                  {group.label}
                </p>
              )}
              {group.items.map((item) => (
                <NavItem key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t mt-auto">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors",
            sidebarCollapsed ? "justify-center px-0" : "justify-start px-3"
          )}
          onClick={onLogout}
        >
          <LogOut className={cn("h-4 w-4", !sidebarCollapsed && "mr-3")} />
          {!sidebarCollapsed && <span className="font-medium">Sign Out</span>}
        </Button>
      </div>
    </div>
  )

  const messagesEndRef = useRef<HTMLDivElement>(null)

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background flex">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "border-r transition-all duration-300 bg-card sticky top-0 h-screen z-40 shadow-sm",
              sidebarCollapsed ? "w-[70px]" : "w-64"
            )}
          >
            <SidebarContent />
          </aside>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-card/80 backdrop-blur-md px-4 lg:px-6 shadow-sm">
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-4">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-64">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            )}

            <div className="flex flex-1 items-center gap-4">
              <div>
                <h1 className="text-lg font-semibold text-foreground leading-tight">{currentPageLabel}</h1>
                <p className="text-[12px] text-muted-foreground hidden sm:block">
                  {activeTab === "overview" ? "Welcome back, " + user.name + " (@" + user.username + ")" : "Manage your " + currentPageLabel.toLowerCase()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <DropdownMenu open={showNotifications} onOpenChange={setShowNotifications}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-muted/20">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white ring-2 ring-card">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                  </div>
                  <ScrollArea className="h-80">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer flex gap-3",
                            !notification.read && "bg-primary/5"
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className={cn(
                            "h-2 w-2 rounded-full mt-1.5 shrink-0",
                            notification.type === 'urgent' ? "bg-red-500" : "bg-blue-500"
                          )} />
                          <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">{notification.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{new Date(notification.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">No new notifications</div>
                    )}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <Separator orientation="vertical" className="h-6 mx-1" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-full justify-start gap-2 px-2 hover:bg-muted/30">
                    <Avatar className="h-7 w-7 border">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary">{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold leading-none">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">@{user.username} • {user.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => setActiveTab("profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600" onClick={onLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-8">
            {activeTab === "overview" && (
              <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Pending Tasks */}
                    <Card className="border-l-4 border-l-amber-500 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pending Tasks</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{pendingTasks.length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                           <CircleDot className="h-2 w-2 text-amber-500" /> Awaiting attention
                        </p>
                      </CardContent>
                    </Card>

                    {/* In Progress */}
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</CardTitle>
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Actively working on</p>
                      </CardContent>
                    </Card>

                    {/* Completed */}
                    <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{completedTasks.length}</div>
                        <p className="text-[10px] text-muted-foreground mt-1">Successfully closed</p>
                      </CardContent>
                    </Card>

                    {/* Overdue */}
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Overdue</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                        <p className="text-[10px] text-red-500/70 mt-1 font-bold">Requires urgent action</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-7">
                    <Card className="lg:col-span-4 shadow-sm border">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-xl font-bold">Recent Assignments</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">Your latest task invitations</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setActiveTab("tasks")} className="text-primary hover:text-primary hover:bg-primary/5">
                          View All
                          <ArrowUpRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {inProgressTasks.length > 0 ? (
                            inProgressTasks.slice(0, 3).map((task) => (
                              <div key={task.id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/20 border border-transparent hover:border-primary/20 hover:bg-white transition-all duration-300">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <FileText className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1 space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-base">{task.title}</h4>
                                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">{task.priority}</Badge>
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                                  <div className="pt-3">
                                    <div className="flex items-center justify-between mb-1.5 px-0.5">
                                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Progress</span>
                                      <span className="text-[10px] font-bold text-primary">{task.progress}%</span>
                                    </div>
                                    <Progress value={task.progress} className="h-1.5 bg-muted/40" />
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-10 text-muted-foreground">No pending assignments</div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="lg:col-span-3 shadow-sm border">
                      <CardHeader>
                        <CardTitle className="text-xl font-bold">Critical Deadlines</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">Don&apos;t let these slip</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-5">
                          {tasks
                            .filter(t => t.status !== "completed")
                            .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                            .slice(0, 4)
                            .map((task) => {
                              const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                              return (
                                <div key={task.id} className="flex items-center gap-4 group">
                                  <div className={cn(
                                    "flex flex-col items-center justify-center h-12 w-12 rounded-xl shrink-0 border transition-colors",
                                    daysLeft <= 2 ? "bg-red-50 border-red-100 text-red-600" : "bg-muted/30 border-muted/50 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary"
                                  )}>
                                    <span className="text-xs font-bold uppercase">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                                    <span className="text-lg font-extrabold leading-none">{new Date(task.dueDate).getDate()}</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
                                    <p className={cn(
                                      "text-xs font-semibold uppercase tracking-wider mt-0.5",
                                      daysLeft <= 0 ? "text-red-500 animate-pulse" : daysLeft <= 2 ? "text-orange-500" : "text-muted-foreground"
                                    )}>
                                      {daysLeft <= 0 ? "Overdue" : `Due in ${daysLeft} days`}
                                    </p>
                                  </div>
                                </div>
                              )
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === "tasks" && (
                <div className="animate-in fade-in slide-in-from-bottom-3 duration-500">
                  <SharedTaskInterface
                    user={user}
                    viewMode="employee"
                    title="Work Management"
                    subtitle="Track your individual contributions and milestone progress."
                  />
                </div>
              )}

              {activeTab === "customers" && <CustomerManagement user={user} />}

              {activeTab === "sales" && <SalesManagement user={user} />}

              {activeTab === "financial" && <FinancialManager user={user} />}

              {activeTab === "revenue_hub" && <RevenueHub user={user} />}

              {activeTab === "employees" && <EmployeeManagement user={user} />}

              {activeTab === "inventory" && <InventoryManager user={user} />}

              {activeTab === "services" && <ServiceMarketplace user={user} />}

              {activeTab === "files" && <BoxFileManagement />}

              {activeTab === "profile" && (
                <ProfileManagement
                  user={user}
                  onSave={handleProfileSave}
                  showBackButton={false}
                  inline={true}
                />
              )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
