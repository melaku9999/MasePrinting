"use client"

import { useState, useEffect } from "react"
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
  TrendingUp,
  CircleDot,
  ArrowUpRight,
  Briefcase
} from "lucide-react"
import { employeesApi } from "@/lib/api"
import { mapBackendTaskToFrontend } from "@/lib/task-utils"
import { connectTaskSocket } from "@/lib/websocket"
import type { User as AuthUser } from "@/lib/auth"

interface EmployeeContentProps {
  user: AuthUser
  activeTab: string
}

export function EmployeeContent({ user, activeTab }: EmployeeContentProps) {
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
      console.error("Failed to fetch tasks:", error)
    } finally {
      setIsLoadingTasks(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    const disconnect = connectTaskSocket(() => fetchDashboardData())
    return () => disconnect()
  }, [user.employee_id])

  const pendingTasks = tasks.filter(t => t.status === "pending")
  const inProgressTasks = tasks.filter(t => t.status === "in-progress")
  const completedTasks = tasks.filter(t => t.status === "completed")

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {activeTab === "overview" && (
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-l-4 border-l-amber-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
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

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In Progress</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inProgressTasks.length}</div>
                <p className="text-[10px] text-muted-foreground mt-1">Actively working on</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Completed Today</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedTasks.length}</div>
                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-2 w-2 text-emerald-500" /> Great progress!
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-2">
             <Card>
               <CardHeader><CardTitle>My Assignments</CardTitle></CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {tasks.slice(0, 5).map(task => (
                      <div key={task.id} className="p-3 bg-muted rounded-lg flex justify-between items-center">
                        <span className="font-medium">{task.title}</span>
                        <Badge>{task.status}</Badge>
                      </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <SharedTaskInterface 
          tasks={tasks} 
          isLoading={isLoadingTasks} 
          onRefresh={fetchDashboardData}
          currentUser={user}
        />
      )}
      {activeTab === "services" && <ServiceMarketplace user={user} />}
      {activeTab === "sales" && <SalesManagement />}
      {activeTab === "inventory" && <InventoryManager />}
      {activeTab === "financial" && <FinancialManager />}
      {activeTab === "revenue_hub" && <RevenueHub />}
      {activeTab === "customers" && <CustomerManagement />}
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
