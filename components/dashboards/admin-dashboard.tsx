"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { CustomerManagement } from "@/components/customers/customer-management"
import { ServiceManagement } from "@/components/services/service-management"
import { TaskManagement } from "@/components/tasks/task-management"
import { AnalyticsCharts } from "@/components/reports/analytics-charts"
import { SalesReport } from "@/components/reports/sales-report"
import { PerformanceReport } from "@/components/reports/performance-report"
import { BoxFileManagement } from "@/components/files/box-file-management"
import { EmployeeManagement } from "@/components/employees/employee-management"
import { AdminChat } from "@/components/chat/admin-chat"
import { AdminChatTelegram } from "@/components/chat/admin-chat-telegram"
import {
  Users,
  Building,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  LogOut,
  Settings,
  Bell,
  BarChart3,
  FolderOpen,
  UserCheck,
  Home,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import type { User } from "@/lib/auth"
import { AdminMyTasksOnly } from "@/components/dashboards/admin-my-tasks-only"

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "customers", label: "Customers", icon: Users },
    { id: "services", label: "Services", icon: Building },
    { id: "tasks", label: "Tasks", icon: CheckCircle2 },
    { id: "mytasks", label: "My Tasks", icon: CheckCircle2 }, // Added My Tasks
    { id: "boxfiles", label: "Box Files", icon: FolderOpen },
    { id: "employees", label: "Employees", icon: UserCheck },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "sales", label: "Sales", icon: DollarSign },
    { id: "performance", label: "Performance", icon: TrendingUp },
    { id: "chat", label: "Customer Chat", icon: Bell },
  ]

  // Mock analytics data
  const stats = {
    totalCustomers: 25,
    activeServices: 12,
    pendingTasks: 8,
    totalFiles: 156,
    monthlyRevenue: 45000,
    growthRate: 12.5,
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn("bg-card border-r transition-all duration-300 flex flex-col", sidebarCollapsed ? "w-16" : "w-64")}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Admin Panel</h2>
                <p className="text-sm text-muted-foreground">Management System</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3 h-10", sidebarCollapsed && "justify-center px-2")}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">{user.name.charAt(0)}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="mt-3 space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8">
                <Settings className="h-3 w-3" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8" onClick={onLogout}>
                <LogOut className="h-3 w-3" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-card-foreground">
                {navigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge variant="secondary">Administrator</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="bg-transparent">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.totalCustomers}</div>
                    <p className="text-xs text-muted-foreground">+2 from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">{stats.activeServices}</div>
                    <p className="text-xs text-muted-foreground">Across all customers</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{stats.pendingTasks}</div>
                    <p className="text-xs text-muted-foreground">Require attention</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.totalFiles}</div>
                    <p className="text-xs text-muted-foreground">Documents stored</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">${stats.monthlyRevenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">+{stats.growthRate}% from last month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">+{stats.growthRate}%</div>
                    <p className="text-xs text-muted-foreground">Month over month</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity & Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New customer registered</p>
                        <p className="text-xs text-muted-foreground">Tech Solutions Inc - 2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Task completed</p>
                        <p className="text-xs text-muted-foreground">Website Redesign Project - 4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                      <div className="w-2 h-2 bg-accent rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Payment received</p>
                        <p className="text-xs text-muted-foreground">$2,500 from Acme Corporation - 1 day ago</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Alerts & Notifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">License expiring soon</p>
                        <p className="text-xs text-muted-foreground">Software license expires in 15 days</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Overdue task</p>
                        <p className="text-xs text-muted-foreground">Website maintenance task is 3 days overdue</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Low prepayment balance</p>
                        <p className="text-xs text-muted-foreground">Customer balance below $500</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "customers" && <CustomerManagement />}
          {activeTab === "services" && <ServiceManagement />}
          {activeTab === "tasks" && <TaskManagement />}
          {activeTab === "mytasks" && (
            <AdminMyTasksOnly />
          )}
          {activeTab === "boxfiles" && <BoxFileManagement />}
          {activeTab === "employees" && <EmployeeManagement />}
          {activeTab === "analytics" && <AnalyticsCharts />}
          {activeTab === "sales" && <SalesReport />}
          {activeTab === "performance" && <PerformanceReport />}
          {activeTab === "chat" && <AdminChatTelegram />}
        </div>
      </div>
    </div>
  )
}
