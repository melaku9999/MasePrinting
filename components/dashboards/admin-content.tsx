"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
  Boxes,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"
import type { User as UserType } from "@/lib/auth"
import { customersApi, servicesApi, tasksApi, financialApi } from "@/lib/api"
import { connectTaskSocket } from "@/lib/websocket"
import { toast } from "sonner"

interface AdminContentProps {
  user: UserType
  activeTab: string
}

export function AdminContent({ user, activeTab }: AdminContentProps) {
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
      if (servicesResponse && servicesResponse.results) {
        activeServices = servicesResponse.count
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
        const financialRes = await financialApi.getGlobalView({ start_date: currentMonthStart })
        monthlyRevenue = (financialRes.payments || [])
          .filter(p => p.type === 'payment' || p.type === 'adjustment')
          .reduce((sum, p) => sum + parseFloat(p.amount), 0)
      } catch (e) {}

      setStats({
        totalCustomers,
        activeServices,
        pendingTasks: totalPendingTasks,
        totalFiles: 156,
        monthlyRevenue,
        growthRate: 12.5,
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
    const disconnect = connectTaskSocket(() => fetchDashboardStats())
    return () => disconnect()
  }, [])

  return (
    <div className="space-y-6">
      {activeTab === "overview" && (
        <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingStats ? "..." : stats.totalCustomers}</div>
                <div className="flex items-center gap-1 mt-1 text-xs text-emerald-600">
                  <ArrowUpRight className="h-3 w-3" /> +2 this month
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                <Building className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingStats ? "..." : stats.activeServices}</div>
                <p className="text-xs text-muted-foreground mt-1">Across all customers</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loadingStats ? "..." : stats.pendingTasks}</div>
                <p className="text-xs text-amber-600 mt-1">Require attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <AnalyticsCharts />
             <PerformanceReport />
          </div>
        </div>
      )}

      {activeTab === "inventory" && <InventoryManager />}
      {activeTab === "financial" && <FinancialManager />}
      {activeTab === "expenses" && <ExpenseManagement />}
      {activeTab === "customers" && <CustomerManagement />}
      {activeTab === "services" && <ServiceManagement />}
      {activeTab === "tasks" && <TaskManagement />}
      {activeTab === "mytasks" && <MimiMyTasks user={user} />}
      {activeTab === "calendar" && <CalendarManagement />}
      {activeTab === "boxfiles" && <BoxFileManagement />}
      {activeTab === "employees" && <EmployeeManagement />}
      {activeTab === "branches" && <BranchManager />}
      {activeTab === "sales" && <SalesReport />}
      {activeTab === "revenue_hub" && <RevenueHub />}
      {activeTab === "content" && <ContentManagement />}
      {activeTab === "inquiries" && <InquiryList />}
    </div>
  )
}
