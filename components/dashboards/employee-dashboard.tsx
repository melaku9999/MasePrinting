"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  TrendingUp,
  Target,
  CircleDot,
  ArrowUpRight,
  Users,
  ShoppingCart,
  DollarSign,
  LineChart,
  Boxes,
  Briefcase,
} from "lucide-react"
import { employeesApi } from "@/lib/api"
import { mapBackendTaskToFrontend } from "@/lib/task-utils"
import { connectTaskSocket } from "@/lib/websocket"
import { toast } from "sonner"
import type { User as AuthUser } from "@/lib/auth"

interface EmployeeDashboardProps {
  user: AuthUser
  initialTab?: string
}

export function EmployeeDashboard({ user, initialTab = "overview" }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

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
    fetchDashboardData()
    const disconnect = connectTaskSocket((update) => {
      fetchDashboardData()
      window.dispatchEvent(new CustomEvent('refreshTasks'))
      if (update.data.assigned_to === user.employee_id) {
        toast.success(`Task Update: ${update.data.title} is now ${update.data.status}`)
      }
    })
    return () => disconnect()
  }, [user.employee_id])

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const overdueTasks = tasks.filter((task) => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && task.status !== "completed"
  })

  return (
    <div className="p-4 lg:p-6 space-y-8">
      {activeTab === "overview" && (
        <div className="max-w-[1400px] mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                            <Badge variant="outline" className="text-[10px] font-bold">{task.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{task.description}</p>
                          <div className="pt-3">
                            <div className="flex items-center justify-between mb-1.5 px-0.5">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase">Progress</span>
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
                            "flex flex-col items-center justify-center h-12 w-12 rounded-xl shrink-0 border transition-colors text-center",
                            daysLeft <= 2 ? "bg-red-50 border-red-100 text-red-600" : "bg-muted/30 border-muted/50 text-muted-foreground group-hover:border-primary/30 group-hover:bg-primary/5 group-hover:text-primary"
                          )}>
                            <span className="text-[10px] font-bold uppercase">{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span className="text-lg font-extrabold leading-none">{new Date(task.dueDate).getDate()}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{task.title}</p>
                            <p className={cn(
                              "text-[10px] font-bold uppercase tracking-wider mt-0.5",
                              daysLeft <= 0 ? "text-red-500" : daysLeft <= 2 ? "text-orange-500" : "text-muted-foreground"
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
        <SharedTaskInterface
          user={user}
          viewMode="employee"
          title="Work Management"
          subtitle="Track your individual contributions and milestone progress."
        />
      )}
      {activeTab === "services" && <ServiceMarketplace user={user} />}
      {activeTab === "sales" && <SalesManagement user={user} />}
      {activeTab === "inventory" && <InventoryManager user={user} />}
      {activeTab === "financial" && <FinancialManager user={user} />}
      {activeTab === "revenue_hub" && <RevenueHub user={user} />}
      {activeTab === "customers" && <CustomerManagement user={user} />}
      {activeTab === "files" && <BoxFileManagement />}
      {activeTab === "profile" && (
        <ProfileManagement
          user={user}
          onSave={() => {}}
          showBackButton={false}
          inline={true}
        />
      )}
    </div>
  )
}
