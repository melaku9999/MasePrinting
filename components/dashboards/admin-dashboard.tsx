"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
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
import { CustomerManagement } from "@/components/customers/customer-management"
import { ServiceManagement } from "@/components/services/service-management"
import { TaskManagement } from "@/components/tasks/task-management"
import { MimiMyTasks } from "./admin-my-tasks-only"
import { AnalyticsCharts } from "@/components/reports/analytics-charts"
import { SalesReport } from "@/components/reports/sales-report"
import { PerformanceReport } from "@/components/reports/performance-report"
import { SalesManagement } from "@/components/sales/sales-management"
import { BoxFileManagement } from "@/components/files/box-file-management"
import { EmployeeManagement } from "@/components/employees/employee-management"
import { AdminChat } from "@/components/chat/admin-chat"
import { AdminChatTelegram } from "@/components/chat/admin-chat-telegram"
import { FinancialManager, RevenueHub, ExpenseManagement } from "@/components/financial"
import { ReminderManager } from "@/components/reminders/reminder-manager"
import { BranchManager } from "@/components/branches/branch-manager"
import { InventoryManager } from "@/components/inventory/inventory-manager"
import { CalendarManagement } from "@/components/tasks/calendar-management"
import { ContentManagement } from "@/components/admin/content-management"
import { InquiryList } from "@/components/admin/inquiry-list"
import {
  Users,
  Building,
  CheckCircle2,
  FileText,
  Boxes,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  LogOut,
  Settings,
  Bell,
  BarChart3,
  FolderOpen,
  UserCheck,
  Home,
  ChevronLeft,
  ChevronRight,
  Search,
  Menu,
  MessageSquare,
  Clock,
  User,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  CircleDot,
  CalendarDays,
  Layout,
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"
import { getAuthToken } from "@/lib/auth"
import { customersApi, servicesApi, tasksApi, filesApi, financialApi } from "@/lib/api"
import { connectTaskSocket } from "@/lib/websocket"
import { toast } from "sonner"


interface AdminDashboardProps {
  user: UserType
  onLogout: () => void
}

// Navigation groups for better organization
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

// Flatten for quick lookups
const allNavigationItems = navigationGroups.flatMap((g) => g.items)

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [stats, setStats] = useState({
    totalCustomers: 0,
    activeServices: 0,
    pendingTasks: 0,
    totalFiles: 0,
    monthlyRevenue: 0,
    growthRate: 0,
    totalDebt: 0,
    unassignedTasks: [] as any[],
  })
  const [loadingStats, setLoadingStats] = useState(true)

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoadingStats(true)
      // Removed authentication check for testing
      console.log("Fetching dashboard stats...")

      const customersResponse = await customersApi.getAll({ page_size: 1 }) as any
      let totalCustomers = 0
      let totalDebt = 0
      if (customersResponse) {
        totalDebt = customersResponse.system_total_debt || 0
        if (customersResponse.results) {
          totalCustomers = customersResponse.count
        }
      }
      console.log("Customers count:", totalCustomers)

      // Fetch services
      const servicesResponse = await servicesApi.getAll(undefined) as any
      let activeServices = 0
      if (servicesResponse) {
        if (servicesResponse.results) {
          activeServices = servicesResponse.count || servicesResponse.results.length
        } else if (Array.isArray(servicesResponse)) {
          activeServices = servicesResponse.length
        } else if (servicesResponse.data) {
          activeServices = servicesResponse.count || servicesResponse.data.length
        }
      }
      console.log("Services count:", activeServices)

      // Fetch tasks for counts and alerts
      const [assignedTasksRes, unassignedTasksRes] = await Promise.all([
        tasksApi.getAssigned({ page_size: 1 }),
        tasksApi.getUnassigned({ page_size: 5 }) 
      ]) as any[]
      
      const unassignedTasks = unassignedTasksRes?.results || []
      const totalPendingTasks = (assignedTasksRes?.count || 0) + (unassignedTasksRes?.count || 0)
      
      // Fetch real revenue and growth
      let monthlyRevenue = 0
      let growthRate = 0
      try {
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        
        // Current month
        const financialRes = await financialApi.getGlobalView({ start_date: currentMonthStart })
        monthlyRevenue = (financialRes.payments || [])
          .filter(p => p.type === 'payment' || p.type === 'adjustment')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)

        // Last month for growth calculation
        const lastMonthRes = await financialApi.getGlobalView({ 
          start_date: lastMonthStart,
          end_date: currentMonthStart // Exclusive of current month
        })
        const lastMonthRevenue = (lastMonthRes.payments || [])
          .filter(p => p.type === 'payment' || p.type === 'adjustment')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)
        
        if (lastMonthRevenue > 0) {
          growthRate = parseFloat(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1))
        } else if (monthlyRevenue > 0) {
          growthRate = 100
        }
      } catch (e) {
        console.error("Error fetching financial stats:", e)
      }

      setStats({
        totalCustomers,
        activeServices: activeServices,
        pendingTasks: totalPendingTasks,
        totalFiles: 156,
        monthlyRevenue,
        growthRate,
        totalDebt,
        unassignedTasks: unassignedTasks 
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
      // Fallback to default values
      setStats({
        totalCustomers: 25,
        activeServices: 12,
        pendingTasks: 8,
        totalFiles: 156,
        monthlyRevenue: 45000,
        growthRate: 12.5,
        totalDebt: 0,
        unassignedTasks: []
      })
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    
    // Real-time synchronization
    const disconnect = connectTaskSocket((update) => {
      console.log('Real-time task update received:', update)
      fetchDashboardStats()
      
      // Dispatch a platform-wide event for sub-components to refresh
      window.dispatchEvent(new CustomEvent('refreshTasks'))
      
      toast.info(`Instant Sync: ${update.data.title} updated to ${update.data.status}`)
    })

    return () => disconnect()
  }, [])

  const handleNavigation = (id: string) => {
    setActiveTab(id)
    setMobileSheetOpen(false)
  }

  const currentPageLabel = allNavigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"

  // Filter navigation groups based on user role
  const filteredNavigationGroups = navigationGroups.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (user.role === "admin") return true
      
      // For employees, we only allow specific items
      const allowedForEmployees = [
        "overview", 
        "customers", 
        "tasks", 
        "mytasks", 
        "financial", 
        "sales",
        "calendar",
        "chat"
      ]
      return allowedForEmployees.includes(item.id)
    })
  })).filter(group => group.items.length > 0)

  // Sidebar content — shared by desktop and mobile sheet
  const sidebarContent = (
    <div className="flex flex-col h-full">
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="ml-auto h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-2 space-y-4">
          {filteredNavigationGroups.map((group) => (
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

                  // Wrap with tooltip when sidebar is collapsed on desktop
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
              <p className="text-[11px] text-muted-foreground truncate">@{user.username} • Administrator</p>
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
      <div className="min-h-screen bg-background flex">
        {/* Desktop sidebar */}
        {!isMobile && (
          <aside
            className={cn(
              "bg-card border-r border-border/60 transition-all duration-300 flex flex-col h-screen sticky top-0 shadow-sm",
              sidebarCollapsed ? "w-[60px]" : "w-[250px]"
            )}
          >
            {sidebarContent}
          </aside>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header */}
          <header className="bg-card border-b border-border/60 sticky top-0 z-40 shadow-sm">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              {/* Left side */}
              <div className="flex items-center gap-3">
                {/* Mobile menu */}
                {isMobile && (
                  <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                        <Menu className="h-5 w-5" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-[280px]">
                      {sidebarContent}
                    </SheetContent>
                  </Sheet>
                )}

                <div>
                  <h1 className="text-lg font-semibold text-foreground leading-tight">{currentPageLabel}</h1>
                  <p className="text-[12px] text-muted-foreground hidden sm:block">
                    {activeTab === "overview" ? "Welcome back, " + user.name + " (@" + user.username + ")" : "Manage your " + currentPageLabel.toLowerCase()}
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="hidden md:flex items-center relative">
                  <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-9 h-9 w-[200px] lg:w-[260px] bg-muted/50 border-border/60 focus-visible:ring-primary/30 text-sm"
                  />
                </div>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="h-9 w-9 relative text-muted-foreground hover:text-foreground">
                  <Bell className="h-4 w-4" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full" />
                </Button>

                <Separator orientation="vertical" className="h-6 hidden sm:block" />

                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-9 gap-2 px-2 text-muted-foreground hover:text-foreground">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground hidden sm:inline">{user.name}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">@{user.username} • {user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-4 lg:p-6">
            {activeTab === "overview" && (
              <div className="space-y-6 max-w-[1400px] mx-auto">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Total Customers */}
                  <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Users className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                        ) : (
                          stats.totalCustomers
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        <p className="text-xs text-emerald-600 font-medium">+2 from last month</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Services */}
                  <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Building className="h-4 w-4 text-emerald-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                        ) : (
                          stats.activeServices
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
                    </CardContent>
                  </Card>

                  {/* Pending Tasks */}
                  <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-amber-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                        ) : (
                          stats.pendingTasks
                        )}
                      </div>
                      <p className="text-xs text-amber-600 font-medium mt-1">Require attention</p>
                    </CardContent>
                  </Card>

                  {/* Total Files */}
                  <Card className="border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-violet-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-16 bg-muted rounded animate-pulse" />
                        ) : (
                          stats.totalFiles
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Documents stored</p>
                    </CardContent>
                  </Card>

                  {/* Monthly Revenue */}
                  <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-cyan-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                        ) : (
                          `$${stats.monthlyRevenue.toLocaleString()}`
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {stats.growthRate >= 0 ? (
                          <ArrowUpRight className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <ArrowDownRight className="h-3 w-3 text-rose-500" />
                        )}
                        <p className={cn(
                          "text-xs font-medium",
                          stats.growthRate >= 0 ? "text-emerald-600" : "text-rose-600"
                        )}>
                          {stats.growthRate >= 0 ? "+" : ""}{stats.growthRate}% from last month
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Debt */}
                  <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">Total Customer Debt</CardTitle>
                      <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-foreground">
                        {loadingStats ? (
                          <div className="h-7 w-20 bg-muted rounded animate-pulse" />
                        ) : (
                          `$${stats.totalDebt.toLocaleString()}`
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Outstanding balances</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="gap-2 text-sm" onClick={() => setActiveTab("customers")}>
                    <Users className="h-3.5 w-3.5" />
                    Add Customer
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-sm" onClick={() => setActiveTab("tasks")}>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Create Task
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-sm" onClick={() => setActiveTab("financial")}>
                    <DollarSign className="h-3.5 w-3.5" />
                    Record Payment
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2 text-sm" onClick={() => setActiveTab("analytics")}>
                    <BarChart3 className="h-3.5 w-3.5" />
                    View Reports
                  </Button>
                </div>

                {/* Activity & Alerts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                  {/* Recent Activity */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                        <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7">
                          View all
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-0">
                      {/* Timeline-style activity items */}
                      <div className="space-y-0">
                        <div className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                          <div className="mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center">
                              <Users className="h-3.5 w-3.5 text-emerald-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">New customer registered</p>
                            <p className="text-xs text-muted-foreground">Tech Solutions Inc</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            2h ago
                          </div>
                        </div>

                        <div className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                          <div className="mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center">
                              <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Task completed</p>
                            <p className="text-xs text-muted-foreground">Website Redesign Project</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            4h ago
                          </div>
                        </div>

                        <div className="flex gap-3 py-3 border-b border-border/40 last:border-0">
                          <div className="mt-0.5">
                            <div className="h-8 w-8 rounded-full bg-cyan-50 flex items-center justify-center">
                              <DollarSign className="h-3.5 w-3.5 text-cyan-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">Payment received</p>
                            <p className="text-xs text-muted-foreground">$2,500 from Acme Corporation</p>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                            <Clock className="h-3 w-3" />
                            1d ago
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Alerts & Notifications */}
                  <Card className="shadow-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-500" />
                          Critical Alerts
                        </CardTitle>
                        <Badge variant="destructive" className="text-[10px] font-bold uppercase tracking-widest">
                          {stats.unassignedTasks.length} Required
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {stats.unassignedTasks.length > 0 ? (
                        stats.unassignedTasks.map((task: any) => (
                          <div key={task.id} className="flex items-start gap-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl group hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab("tasks")}>
                            <div className="h-10 w-10 shrink-0 rounded-xl bg-white shadow-sm flex items-center justify-center text-rose-600 border border-rose-100 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                              <AlertCircle className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tighter">{task.title}</p>
                                <span className="text-[10px] font-bold text-rose-500 whitespace-nowrap">NEW</span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-1">Customer: {task.customer?.name || "Private Client"}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-1 w-full bg-rose-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-rose-500" 
                                    style={{ width: `${task.priority === 3 ? 100 : task.priority === 2 ? 60 : 30}%` }} 
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Manifest Synchronized</p>
                          <p className="text-[10px] text-slate-400 mt-1">No unassigned tasks pending.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "customers" && <CustomerManagement user={user} />}
            {activeTab === "services" && <ServiceManagement />}
            {activeTab === "tasks" && <TaskManagement user={user} />}
            {activeTab === "mytasks" && (
              <MimiMyTasks user={user} />
            )}
            {activeTab === "boxfiles" && <BoxFileManagement />}
            {activeTab === "employees" && <EmployeeManagement user={user} />}
            {activeTab === "branches" && <BranchManager />}
            {activeTab === "inventory" && <InventoryManager user={user} />}
            { activeTab === "financial" && <FinancialManager user={user} /> }
            { activeTab === "expenses" && <ExpenseManagement user={user} /> }
            { activeTab === "revenue_hub" && <RevenueHub user={user} /> }
            {activeTab === "reminders" && <ReminderManager />}
            {activeTab === "calendar" && <CalendarManagement user={user} />}
            {activeTab === "analytics" && <AnalyticsCharts />}
            {activeTab === "sales" && <SalesManagement user={user} />}
            {activeTab === "performance" && <PerformanceReport />}
            {activeTab === "content" && <ContentManagement />}
            {activeTab === "inquiries" && <InquiryList />}
            {activeTab === "chat" && <AdminChatTelegram />}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
