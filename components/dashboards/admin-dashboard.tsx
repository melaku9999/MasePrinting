"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { CustomerManagement } from "@/components/customers/customer-management"
import { ServiceManagement } from "@/components/services/service-management"
import { TaskManagement } from "@/components/tasks/task-management"
import { MimiMyTasks } from "./admin-my-tasks-only"
import { AnalyticsCharts } from "@/components/reports/analytics-charts"
import { SalesManagement } from "@/components/sales/sales-management"
import { BoxFileManagement } from "@/components/files/box-file-management"
import { EmployeeManagement } from "@/components/employees/employee-management"
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
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Clock,
  Home,
  MessageSquare,
  LineChart,
  Layout,
  FolderOpen,
  UserCheck,
} from "lucide-react"
import { type User } from "@/lib/auth"
import { tasksApi, financialApi, customersApi, servicesApi } from "@/lib/api"
import { connectTaskSocket } from "@/lib/websocket"
import { PerformanceReport } from "@/components/reports/performance-report"
import { toast } from "sonner"

interface AdminDashboardProps {
  user: User
  initialTab?: string
}

export function AdminDashboard({ user, initialTab = "overview" }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync activeTab when initialTab changes (e.g., via URL)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

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
      const customersResponse = await customersApi.getAll({ page_size: 1 }) as any
      let totalCustomers = 0
      let totalDebt = 0
      if (customersResponse) {
        totalDebt = customersResponse.system_total_debt || 0
        if (customersResponse.results) {
          totalCustomers = customersResponse.count
        }
      }

      const servicesResponse = await servicesApi.getAll(undefined) as any
      let activeServices = 0
      if (servicesResponse) {
        if (servicesResponse.results) {
          activeServices = servicesResponse.count || servicesResponse.results.length
        } else if (Array.isArray(servicesResponse)) {
          activeServices = servicesResponse.length
        }
      }

      const [assignedTasksRes, unassignedTasksRes] = await Promise.all([
        tasksApi.getAssigned({ page_size: 1 }),
        tasksApi.getUnassigned({ page_size: 5 }) 
      ]) as any[]
      
      const unassignedTasks = unassignedTasksRes?.results || []
      const totalPendingTasks = (assignedTasksRes?.count || 0) + (unassignedTasksRes?.count || 0)
      
      let monthlyRevenue = 0
      let growthRate = 0
      try {
        const now = new Date()
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
        
        const financialRes = await financialApi.getGlobalView({ start_date: currentMonthStart })
        monthlyRevenue = (financialRes.payments || [])
          .filter(p => p.type === 'payment' || p.type === 'adjustment')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)

        const lastMonthRes = await financialApi.getGlobalView({ 
          start_date: lastMonthStart,
          end_date: currentMonthStart
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
        activeServices,
        pendingTasks: totalPendingTasks,
        totalFiles: 156,
        monthlyRevenue,
        growthRate,
        totalDebt,
        unassignedTasks
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  useEffect(() => {
    fetchDashboardStats()
    const disconnect = connectTaskSocket((update: any) => {
      fetchDashboardStats()
      window.dispatchEvent(new CustomEvent('refreshTasks'))
      toast.info(`Instant Sync: ${update.data.title} updated to ${update.data.status}`)
    })
    return () => disconnect()
  }, [])

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {activeTab === "overview" && (
        <div className="space-y-6 max-w-[1400px] mx-auto">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : stats.totalCustomers}
                </div>
                <div className="flex items-center gap-1 mt-1 font-medium text-xs text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" />
                  +2 from last month
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Services</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <Building className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : stats.activeServices}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending Tasks</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : stats.pendingTasks}
                </div>
                <p className="text-xs text-amber-600 font-medium mt-1">Require attention</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-violet-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Files</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-violet-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-16 bg-muted rounded animate-pulse" /> : stats.totalFiles}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Documents stored</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-cyan-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-cyan-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-20 bg-muted rounded animate-pulse" /> : `$${stats.monthlyRevenue.toLocaleString()}`}
                </div>
                <div className={cn("flex items-center gap-1 mt-1 font-medium text-xs", stats.growthRate >= 0 ? "text-emerald-600" : "text-rose-600")}>
                  {stats.growthRate >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {stats.growthRate >= 0 ? "+" : ""}{stats.growthRate}% from last month
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Customer Debt</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-rose-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loadingStats ? <div className="h-7 w-20 bg-muted rounded animate-pulse" /> : `$${stats.totalDebt.toLocaleString()}`}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Outstanding balances</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("customers")}>
              <Users className="h-4 w-4" /> Add Customer
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("tasks")}>
              <CheckCircle2 className="h-4 w-4" /> Create Task
            </Button>
            <Button size="sm" variant="outline" className="gap-2" onClick={() => setActiveTab("financial")}>
              <DollarSign className="h-4 w-4" /> Record Payment
            </Button>
          </div>

          {/* Activity & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b border-border/40">
                <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="divide-y divide-border/40">
                  <div className="flex gap-3 py-4">
                    <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New customer registered</p>
                      <p className="text-xs text-muted-foreground">Tech Solutions Inc</p>
                    </div>
                    <div className="text-[10px] text-muted-foreground uppercase flex items-center gap-1">
                      <Clock className="h-3 w-3" /> 2h ago
                    </div>
                  </div>
                  {/* More activity items can go here */}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-rose-100">
              <CardHeader className="pb-3 border-b border-rose-100 bg-rose-50/30">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-rose-900">
                    <AlertTriangle className="h-4 w-4 text-rose-500" />
                    Critical Alerts
                  </CardTitle>
                  <Badge variant="destructive" className="text-[10px]">
                    {stats.unassignedTasks.length} Required
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {stats.unassignedTasks.length > 0 ? (
                  stats.unassignedTasks.map((task: any) => (
                    <div key={task.id} className="flex flex-col gap-2 p-3 bg-white border border-rose-100 rounded-xl hover:shadow-sm transition-all" onClick={() => setActiveTab("tasks")}>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-bold truncate">{task.title}</p>
                        <span className="text-[10px] font-bold text-rose-500">NEW</span>
                      </div>
                      <p className="text-xs text-slate-500">Customer: {task.customer?.name || "Private Client"}</p>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    <p className="text-xs font-bold uppercase">All caught up</p>
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
      {activeTab === "mytasks" && <MimiMyTasks user={user} />}
      {activeTab === "boxfiles" && <BoxFileManagement />}
      {activeTab === "employees" && <EmployeeManagement user={user} />}
      {activeTab === "branches" && <BranchManager />}
      {activeTab === "inventory" && <InventoryManager user={user} />}
      {activeTab === "financial" && <FinancialManager user={user} />}
      {activeTab === "expenses" && <ExpenseManagement user={user} />}
      {activeTab === "revenue_hub" && <RevenueHub user={user} />}
      {activeTab === "reminders" && <ReminderManager />}
      {activeTab === "calendar" && <CalendarManagement user={user} />}
      {activeTab === "sales" && <SalesManagement user={user} />}
      {activeTab === "performance" && <PerformanceReport />}
      {activeTab === "content" && <ContentManagement />}
      {activeTab === "inquiries" && <InquiryList />}
      {activeTab === "chat" && <AdminChatTelegram />}
    </div>
  )
}
