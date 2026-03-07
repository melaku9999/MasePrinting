"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, User, Mail, Phone, MapPin, Calendar, DollarSign, Users, AlertTriangle, CheckCircle2, Clock, Star, TrendingUp, Loader2, AlertCircle, ShoppingCart, Building2, LayoutDashboard, ClipboardList, ShieldCheck, Lock } from "lucide-react"
import { employeesApi, tasksApi, salesApi, authApi } from "@/lib/api"
import { EmployeeTaskManagement } from "./employee-task-management"
import type { User as AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"

interface Employee {
  id: number
  user_id?: number
  name: string
  email: string
  phone: string
  address: string
  status: string
  job_title: string
  department: string
  branch?: number
  branch_name?: string
  start_date: string
  monthly_salary: string
  emergency_contact_person: string
  emergency_contact_person_phone: string
  created_at: string
  updated_at: string
}

interface EmployeeTask {
  id: number
  title: string
  status: string
  priority: number
  due_date: string
  progress: number
  base_price: string
  customer_name: string
  assigned_employee: string
}

type ViewMode = "details" | "tasks" | "sales" | "security"

interface EmployeeDetailsProps {
  employee: Employee
  onBack: () => void
  initialViewMode?: ViewMode
  adminUser?: AuthUser
}

export function EmployeeDetails({ employee, onBack, initialViewMode, adminUser }: EmployeeDetailsProps) {
  const isAdminSession = adminUser?.role === "admin"
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode || "details")
  const [employeeDetails, setEmployeeDetails] = useState<Employee | null>(null)
  const [employeeTasks, setEmployeeTasks] = useState<EmployeeTask[]>([])
  const [employeeSales, setEmployeeSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tasksLoading, setTasksLoading] = useState(false)
  const [salesLoading, setSalesLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Password change state
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)

  // Fetch employee details, tasks and sales
  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Fetch detailed employee info
        const detailsResponse = await employeesApi.getById(employee.id.toString())
        if (detailsResponse) {
          setEmployeeDetails(detailsResponse)
        } else {
          setEmployeeDetails(employee)
        }

        // Fetch employee tasks
        setTasksLoading(true)
        const tasksResponse = await employeesApi.getTasks(employee.id.toString())
        if (tasksResponse && tasksResponse.results) {
          setEmployeeTasks(tasksResponse.results)
        } else {
          setEmployeeTasks([])
        }

        // Fetch employee sales
        setSalesLoading(true)
        try {
          const salesResponse = await salesApi.getAll({ employee: employee.id })
          setEmployeeSales(Array.isArray(salesResponse) ? salesResponse : (salesResponse as any).results || [])
        } catch (sErr) {
          console.error("Error fetching employee sales:", sErr)
          setEmployeeSales([])
        }
      } catch (err) {
        console.error("Error fetching employee data:", err)
        setError("Failed to load employee details")
        setEmployeeDetails(employee)
        setEmployeeTasks([])
      } finally {
        setLoading(false)
        setTasksLoading(false)
        setSalesLoading(false)
      }
    }

    fetchEmployeeData()
  }, [employee.id])

  // Calculate task statistics
  const getTaskStats = () => {
    const totalTasks = employeeTasks.length
    const completedTasks = employeeTasks.filter(task => task.status === "completed").length
    const inProgressTasks = employeeTasks.filter(task => task.status === "in_progress").length
    const pendingTasks = employeeTasks.filter(task => task.status === "pending").length
    const overdueTasks = employeeTasks.filter(task => 
      task.status !== "completed" && new Date(task.due_date) < new Date()
    ).length

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    const averageRating = 4.5 // Default rating, could be calculated from task feedback

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      averageRating
    }
  }

  const stats = getTaskStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading employee details...</p>
        </div>
      </div>
    )
  }

  if (error && !employeeDetails) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p className="text-destructive mb-2">{error}</p>
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Employees
          </Button>
        </div>
      </div>
    )
  }

  const currentEmployee = employeeDetails || employee

  const authUser: AuthUser = {
    id: currentEmployee.id.toString(),
    name: currentEmployee.name,
    email: currentEmployee.email,
    role: "employee",
    avatar: "/placeholder.svg"
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Profile Sidebar */}
      <aside className="w-full lg:w-72 shrink-0 space-y-6">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 hover:bg-primary/5 text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Directory
        </Button>

        <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden">
          <div className="h-24 bg-gradient-to-br from-primary/20 to-blue-500/20" />
          <CardContent className="pt-0 -mt-12 text-center pb-6">
            <Avatar className="h-24 w-24 mx-auto border-4 border-white shadow-lg mb-4">
              <AvatarImage src={`https://avatar.vercel.sh/${currentEmployee.email}`} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {currentEmployee.name[0]}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-xl font-bold">{currentEmployee.name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{currentEmployee.job_title}</p>
            <Badge variant="secondary" className="mt-2 rounded-full px-3">
              {currentEmployee.status}
            </Badge>
          </CardContent>

          <Separator className="opacity-50" />

          <nav className="p-4 space-y-1">
            <Button 
              variant={viewMode === "details" ? "secondary" : "ghost"} 
              className={cn("w-full justify-start gap-3 h-11 rounded-xl", viewMode === "details" && "bg-primary/10 text-primary hover:bg-primary/15")}
              onClick={() => setViewMode("details")}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span className="font-bold text-sm">Personal Overview</span>
            </Button>
            <Button 
              variant={viewMode === "tasks" ? "secondary" : "ghost"} 
              className={cn("w-full justify-start gap-3 h-11 rounded-xl", viewMode === "tasks" && "bg-primary/10 text-primary hover:bg-primary/15")}
              onClick={() => setViewMode("tasks")}
            >
              <ClipboardList className="h-4 w-4" />
              <span className="font-bold text-sm">Task Hub</span>
            </Button>
            <Button 
              variant={viewMode === "sales" ? "secondary" : "ghost"} 
              className={cn("w-full justify-start gap-3 h-11 rounded-xl", viewMode === "sales" && "bg-primary/10 text-primary hover:bg-primary/15")}
              onClick={() => setViewMode("sales")}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="font-bold text-sm">Sales Records</span>
            </Button>
            <Button 
              variant={viewMode === "security" ? "secondary" : "ghost"} 
              className={cn("w-full justify-start gap-3 h-11 rounded-xl", viewMode === "security" && "bg-primary/10 text-primary hover:bg-primary/15")}
              onClick={() => setViewMode("security")}
            >
              <Lock className="h-4 w-4" />
              <span className="font-bold text-sm">Security</span>
            </Button>
          </nav>
        </Card>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        {viewMode === "sales" ? (
          <Card className="border-none shadow-xl shadow-black/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2 border-b border-primary/10">
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShoppingCart className="h-5 w-5" />
                Transaction History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {salesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : employeeSales.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-medium text-lg">No sales recorded for this employee yet</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">Transactions will appear here once processed at a branch.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {employeeSales.map((sale) => (
                    <div key={sale.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 border border-border/60 rounded-3xl bg-white hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/30">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-xl italic text-primary/40">#{sale.id}</span>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 uppercase tracking-widest text-[10px] font-black">Success</Badge>
                        </div>
                        <p className="text-lg font-bold text-foreground">
                          {sale.customer_details?.name}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {sale.items?.map((i: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="rounded-lg bg-muted/50 text-[10px] lowercase font-medium">
                              {i.quantity}x {i.product_name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="mt-6 md:mt-0 md:text-right flex flex-col items-end">
                        <div className="text-3xl font-black text-primary tracking-tighter">${parseFloat(sale.total_amount).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-60">
                          {new Date(sale.timestamp || sale.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                        <Badge variant="outline" className="mt-3 rounded-xl bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1.5 py-1 px-3">
                          <Building2 className="h-3.5 w-3.5" /> 
                          <span className="font-bold text-[11px]">{sale.branch_name}</span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "security" ? (
          <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Account Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8 max-w-xl">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-bold text-lg">{isAdminSession ? "Reset Member Password (Admin)" : "Change Your Password"}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isAdminSession 
                      ? "As an administrator, you are performing a mandatory reset of this employee's security credentials." 
                      : "Keep your account secure by updating your password regularly."}
                  </p>
                </div>
                
                {passwordSuccess && (
                  <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-bold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Password updated successfully!
                  </div>
                )}
                
                {passwordError && (
                  <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-bold flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {passwordError}
                  </div>
                )}

                <div className="space-y-4">
                  {!isAdminSession && (
                    <div className="space-y-1">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Current Password</label>
                      <input 
                        type="password"
                        className="w-full h-12 bg-muted/30 border-none rounded-2xl px-4 font-medium focus:ring-2 ring-primary/20 transition-all"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Required for identity verification"
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Password</label>
                    <input 
                      type="password"
                      className="w-full h-12 bg-muted/30 border-none rounded-2xl px-4 font-medium focus:ring-2 ring-primary/20 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Confirm New Password</label>
                    <input 
                      type="password"
                      className="w-full h-12 bg-muted/30 border-none rounded-2xl px-4 font-medium focus:ring-2 ring-primary/20 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <Button 
                  className="w-full h-12 rounded-2xl font-bold gap-2 mt-4" 
                  disabled={passwordLoading || (!isAdminSession && !oldPassword) || !newPassword || newPassword !== confirmPassword}
                  onClick={async () => {
                    try {
                      setPasswordLoading(true)
                      setPasswordError(null)
                      setPasswordSuccess(false)
                      
                      const token = localStorage.getItem("cm_token")
                      if (!token) throw new Error("Not authenticated")

                      if (isAdminSession) {
                        // Admin Reset Logic
                        if (!currentEmployee.user_id) throw new Error("Synchronization Error: Root user ID not found")
                        
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/users/users/${currentEmployee.user_id}/update/`, {
                          method: 'PUT',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            password: newPassword
                          })
                        })

                        if (!response.ok) {
                          const errData = await response.json()
                          throw new Error(errData.detail || "Administrative override failed")
                        }
                      } else {
                        // Self-Change Logic
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api'}/users/change-password/`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            old_password: oldPassword,
                            new_password: newPassword
                          })
                        })

                        if (!response.ok) {
                          const errData = await response.json()
                          throw new Error(errData.error || "Failed to update password")
                        }
                      }

                      setPasswordSuccess(true)
                      setOldPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    } catch (err: any) {
                      setPasswordError(err.message)
                    } finally {
                      setPasswordLoading(false)
                    }
                  }}
                >
                  {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isAdminSession ? "Reset & Push New Credentials" : "Update Secure Credentials"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : viewMode === "tasks" ? (
          <div className="bg-white rounded-[2rem] border border-border/60 shadow-xl shadow-black/5 overflow-hidden min-h-[600px]">
            <EmployeeTaskManagement
              employee={authUser}
              onBack={() => setViewMode("details")}
              hideBack
              defaultEmployeeId={currentEmployee.id.toString()}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Employee Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Contact Details</label>
                        <div className="space-y-4">
                          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
                            <Mail className="h-5 w-5 text-primary/60" />
                            <span className="text-sm font-semibold">{currentEmployee.email}</span>
                          </div>
                          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
                            <Phone className="h-5 w-5 text-primary/60" />
                            <span className="text-sm font-semibold">{currentEmployee.phone}</span>
                          </div>
                          <div className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 group-hover:bg-muted/50 transition-colors">
                            <MapPin className="h-5 w-5 text-primary/60" />
                            <span className="text-sm font-semibold">{currentEmployee.address}</span>
                          </div>
                        </div>
                      </div>

                      {currentEmployee.branch_name && (
                        <div className="p-6 rounded-[2rem] bg-primary/5 border border-primary/10">
                          <div className="flex items-center gap-3 mb-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            <span className="text-sm font-black uppercase tracking-tighter">Assigned Headquarters</span>
                          </div>
                          <p className="text-2xl font-black text-primary">{currentEmployee.branch_name}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div className="group">
                        <label className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2 block">Employment Profile</label>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-primary/60" />
                              <span className="text-sm font-medium">Joined Date</span>
                            </div>
                            <span className="text-sm font-bold">{new Date(currentEmployee.start_date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30">
                            <div className="flex items-center gap-3">
                              <DollarSign className="h-5 w-5 text-primary/60" />
                              <span className="text-sm font-medium">Monthly Pay</span>
                            </div>
                            <span className="text-sm font-bold text-emerald-600">${parseFloat(currentEmployee.monthly_salary).toLocaleString()}</span>
                          </div>
                          <div className="flex flex-col gap-2 p-4 rounded-2xl bg-muted/30">
                             <div className="flex items-center gap-3">
                              <Users className="h-5 w-5 text-primary/60" />
                              <span className="text-sm font-medium">Emergency Contact</span>
                            </div>
                            <p className="text-sm font-bold pl-8">{currentEmployee.emergency_contact_person}</p>
                            <p className="text-xs text-muted-foreground pl-8">{currentEmployee.emergency_contact_person_phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Tasks Mini-view */}
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 overflow-hidden">
                <CardHeader className="bg-primary/5 pb-2">
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        Active Assignments
                      </div>
                      <Button variant="link" size="sm" onClick={() => setViewMode("tasks")} className="text-primary font-black">
                        View Hub
                      </Button>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {tasksLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2 text-primary" />
                    </div>
                  ) : employeeTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground font-medium italic">No active assignments for this member</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {employeeTasks.slice(0, 4).map((task) => (
                        <div key={task.id} className="p-4 border border-border/60 rounded-2xl bg-white hover:bg-muted/5 transition-colors">
                          <h4 className="font-bold truncate mb-1">{task.title}</h4>
                          <div className="flex items-center gap-2 mb-3">
                             <Badge variant={task.status === "completed" ? "default" : "secondary"} className="text-[9px] h-4 rounded-md">
                                {task.status}
                             </Badge>
                             <span className="text-[10px] text-muted-foreground font-bold uppercase">{new Date(task.due_date).toLocaleDateString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                            <div 
                              className="bg-primary h-full transition-all"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Stats Sidebar */}
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 bg-primary text-primary-foreground overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-black uppercase tracking-widest opacity-80">Rank & Rating</CardTitle>
                </CardHeader>
                <CardContent className="pb-8">
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-6xl font-black">{stats.averageRating.toFixed(1)}</span>
                    <Star className="h-6 w-6 fill-current text-yellow-400" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase opacity-80">
                      <span>Performance Index</span>
                      <span>{stats.completionRate.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white transition-all"
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 overflow-hidden">
                 <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Workload Status</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-4 pt-2">
                    {[
                      { label: "Completed", count: stats.completedTasks, color: "text-emerald-500", bg: "bg-emerald-50" },
                      { label: "In Progress", count: stats.inProgressTasks, color: "text-blue-500", bg: "bg-blue-50" },
                      { label: "Pending", count: stats.pendingTasks, color: "text-amber-500", bg: "bg-amber-50" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-3xl bg-muted/20 border border-transparent hover:border-border/60 transition-colors">
                        <span className="font-bold text-sm">{item.label}</span>
                        <div className={cn("px-4 py-1 rounded-full font-black text-xs", item.bg, item.color)}>
                          {item.count}
                        </div>
                      </div>
                    ))}
                 </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
