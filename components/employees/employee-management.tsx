"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, UserPlus, MoreVertical, CheckCircle2, ArrowLeft, Loader2, ChevronLeft, ChevronRight, Mail, Phone, Building2, User, Edit, Briefcase, Layout, TrendingUp, Users, ShoppingCart, Filter, Trash2 } from "lucide-react"
import { mockUsers } from "@/lib/auth"
import { EmployeeForm } from "./employee-form"
import { EmployeeTaskManagement } from "./employee-task-management"
import { EmployeeDetails } from "./employee-details"
import { employeesApi } from "@/lib/api"
import type { User as AuthUser } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface Employee {
  id: number
  username?: string
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

type ViewMode = "list" | "add" | "edit" | "view" | "tasks" | "details" | "analytics"

interface EmployeeManagementProps {
  user?: AuthUser
}

export function EmployeeManagement({ user }: EmployeeManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedEmployee, setSelectedEmployee] = useState<AuthUser | null>(null)
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = user?.role === "admin"

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 10
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  const [initialViewMode, setInitialViewMode] = useState<"details" | "sales" | "tasks">("details")

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await employeesApi.getAll({
          page: currentPage,
          page_size: pageSize,
          search: searchTerm || undefined
        })

        if (response && response.results) {
          setEmployees(response.results)
          setTotalPages(Math.ceil((response.count || 0) / pageSize))
          setHasNext(!!response.next)
          setHasPrevious(!!response.previous)
        } else {
          setEmployees([])
          setTotalPages(1)
          setHasNext(false)
          setHasPrevious(false)
        }
      } catch (err) {
        console.error("Error fetching employees:", err)
        setError("Failed to load employees")
        // Fallback to mock data
        const mockEmployees = mockUsers.filter((u) => u.role === "employee").map((u, index) => ({
          id: 1000 + index,
          name: u.name,
          email: u.email,
          phone: "+1 (555) 000-0000",
          address: "123 Business Way",
          status: "active",
          job_title: "Staff Member",
          department: "Operations",
          start_date: "2023-01-01",
          monthly_salary: "0.00",
          emergency_contact_person: "N/A",
          emergency_contact_person_phone: "N/A",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))
        setEmployees(mockEmployees)
      } finally {
        setLoading(false)
      }
    }

    fetchEmployees()
  }, [currentPage, searchTerm])

  const handleAction = (mode: ViewMode, employee: Employee, subMode: "details" | "sales" | "tasks" = "details") => {
    const authUser: AuthUser = {
      id: employee.id.toString(),
      username: employee.username || employee.email.split('@')[0],
      name: employee.name,
      email: employee.email,
      role: "employee",
      branch_id: employee.branch,
    }
    setSelectedEmployee(authUser)
    setSelectedEmployeeData(employee)
    setInitialViewMode(subMode)
    setViewMode(mode)
  }

  const handleDeleteEmployee = async (employee: Employee) => {
    if (!confirm(`Are you sure you want to permanently remove "${employee.name}" from the active directory? This will revoke all access and erase their personnel profile.`)) {
      return
    }

    try {
      setLoading(true)
      await employeesApi.delete(employee.id.toString())
      toast.success(`Personnel record for "${employee.name}" has been purged`)
      
      // Force refresh
      setSearchTerm(prev => prev + " ")
      setTimeout(() => setSearchTerm(prev => prev.trim()), 0)
    } catch (err: any) {
      console.error("Deletion failed:", err)
      toast.error(err.message || "Failed to remove personnel record from server")
    } finally {
      setLoading(false)
    }
  }

  const [activeSubTab, setActiveSubTab] = useState<"directory" | "analytics">("directory")

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6">
        <EmployeeForm
          employee={selectedEmployeeData || undefined}
          onSave={async (data) => {
            try {
              if (viewMode === "edit" && selectedEmployeeData) {
                await employeesApi.update(selectedEmployeeData.id.toString(), data)
                toast.success("Employee record synchronized")
              } else {
                await employeesApi.create(data)
                toast.success("Strategic asset onboarded successfully")
              }
              // Refresh the list
              setSearchTerm(prev => prev + " ") // Trigger a minor re-fetch
              setTimeout(() => setSearchTerm(prev => prev.trim()), 0)
              setViewMode("list")
            } catch (err: any) {
              console.error("Critical onboarding failure:", err)
              toast.error(err.message || "Failed to process personnel record")
            }
          }}
          onCancel={() => setViewMode("list")}
        />
      </div>
    )
  }

  if (viewMode === "tasks" && selectedEmployee) {
    return (
      <EmployeeTaskManagement
        employee={selectedEmployee}
        onBack={() => setViewMode("list")}
      />
    )
  }

  if (viewMode === "details" && selectedEmployeeData) {
    return (
      <EmployeeDetails
        employee={selectedEmployeeData}
        onBack={() => setViewMode("list")}
        initialViewMode={initialViewMode}
        adminUser={user}
      />
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-12rem)]">
      {/* Local Sidebar */}


      <div className="flex-1 space-y-8 pb-10">
        {activeSubTab === "analytics" ? (
          <div className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Sales Tracking</h2>
              <p className="text-muted-foreground text-lg">Detailed performance metrics and branch-wise sales analysis.</p>
            </div>
            
            <Card className="rounded-[2.5rem] border-none shadow-xl shadow-black/5 overflow-hidden">
               <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                  <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
                    <TrendingUp className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Global Sales Intelligence</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mb-8">
                    View individual employee sales by clicking "Pro-Profile" or manage branch inventory in the dedicated modules.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100">
                      <p className="text-emerald-600 font-bold uppercase tracking-widest text-xs mb-1">Total Team Sales</p>
                      <h4 className="text-3xl font-black text-emerald-700">$124,500</h4>
                    </div>
                    <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
                      <p className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-1">Top Branch</p>
                      <h4 className="text-2xl font-black text-blue-700">Main Headquarters</h4>
                    </div>
                  </div>
               </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-4xl font-black tracking-tighter text-slate-900">Active Directory</h1>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Human Capital & Strategic Resource Allocation</p>
              </div>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
              <div className="relative flex-1 group w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                <Input
                  placeholder="Search by name, email or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
                  <Filter className="h-4 w-4 text-slate-400" />
                </Button>
                {isAdmin && (
                  <Button 
                    onClick={() => setViewMode("add")} 
                    className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest gap-2"
                  >
                    <UserPlus className="h-3.5 w-3.5" /> Onboard Human Capital
                  </Button>
                )}
              </div>
            </div>

            {/* Employee List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-border/60 shadow-xl shadow-black/5">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-muted-foreground font-medium">Synchronizing records...</p>
              </div>
            ) : employees.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <Card key={employee.id} className="group rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden hover:shadow-2xl transition-all duration-300">
                    <div className="h-24 bg-gradient-to-r from-primary/10 to-blue-500/10 relative">
                      <div className="absolute top-4 right-4 translate-x-1 group-hover:translate-x-0 transition-transform">
                        <Badge variant="outline" className="bg-white/80 backdrop-blur-sm border-none shadow-sm rounded-full text-[10px] uppercase font-bold tracking-wider px-2 py-0.5">
                          {employee.department}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="px-6 pb-6 pt-0 relative">
                      <div className="flex flex-col items-center -mt-12 text-center">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                          <AvatarImage src={`https://avatar.vercel.sh/${employee.email}`} />
                          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">{employee.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="mt-4 space-y-1">
                          <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{employee.name}</h3>
                          <p className="text-sm font-semibold text-muted-foreground/80 uppercase tracking-wider">{employee.job_title}</p>
                        </div>

                        <div className="w-full h-[1px] bg-border/40 my-6" />

                        <div className="w-full space-y-3 px-2">
                          <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Mail className="h-4 w-4 shrink-0 text-primary/60" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Phone className="h-4 w-4 shrink-0 text-primary/60" />
                            <span>{employee.phone}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                            <Briefcase className="h-4 w-4 shrink-0 text-primary/60" />
                            <span>{employee.department}</span>
                          </div>
                          {employee.branch_name && (
                            <div className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors">
                              <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
                              <span className="font-bold text-primary">{employee.branch_name}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border/40 w-full flex items-center justify-between">
                          <Button variant="ghost" size="sm" className="rounded-xl h-10 px-4 text-muted-foreground hover:text-primary hover:bg-primary/5 font-bold" onClick={() => handleAction("details", employee)}>
                            Pro-Profile
                          </Button>

                          {isAdmin ? (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48 rounded-2xl overflow-hidden shadow-2xl border-border/40">
                                <DropdownMenuItem className="py-3 px-4 font-bold text-sm cursor-pointer" onClick={() => handleAction("edit", employee)}>
                                  <Edit className="h-4 w-4 mr-3 text-blue-500" /> Modify Record
                                </DropdownMenuItem>
                                <DropdownMenuItem className="py-3 px-4 font-bold text-sm cursor-pointer" onClick={() => handleAction("details", employee, "sales")}>
                                  <ShoppingCart className="h-4 w-4 mr-3 text-emerald-500" /> Sales History
                                </DropdownMenuItem>
                                <DropdownMenuItem className="py-3 px-4 font-bold text-sm cursor-pointer text-red-500 hover:bg-red-50" onClick={() => handleAction("tasks", employee)}>
                                  <CheckCircle2 className="h-4 w-4 mr-3 text-red-500" /> Assignment Hub
                                </DropdownMenuItem>
                                <DropdownMenuItem className="py-3 px-4 font-bold text-sm cursor-pointer text-rose-600 hover:bg-rose-50" onClick={() => handleDeleteEmployee(employee)}>
                                  <Trash2 className="h-4 w-4 mr-3 text-rose-600" /> Termination / Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          ) : (
                            <div className="h-10 w-10 rounded-xl bg-muted/30 flex items-center justify-center text-muted-foreground/40">
                              <User className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-dashed border-border/60">
                <User className="h-16 w-16 text-muted-foreground/20 mb-4" />
                <h3 className="text-2xl font-bold">No results found</h3>
                <p className="text-muted-foreground mt-2">Try searching with a different term or filtering.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12 bg-white w-fit mx-auto p-2 rounded-2xl border border-border/60 shadow-sm">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={!hasPrevious}
                  className="rounded-xl hover:bg-primary/5"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="px-4 font-extrabold text-sm tracking-widest text-muted-foreground">
                  PAGE {currentPage} <span className="text-primary/40 mx-2">/</span> {totalPages}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasNext}
                  className="rounded-xl hover:bg-primary/5"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}