"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Calendar,
  User,
  AlertCircle,
  CheckCircle2,
  Building2,
  Timer,
  Target,
  BarChart3,
  Filter,
  Users,
  Layers,
  TrendingUp,
  UserPlus,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from "lucide-react"
import { mockUsers, type Task, getAuthToken } from "@/lib/auth"
import { tasksApi, employeesApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface Employee {
  employee_id: number
  employee_name: string
}

// Extended Task interface to include assigned_employee field
interface ExtendedTask extends Task {
  assigned_employee?: string
}

interface TaskListProps {
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onAddTask: () => void
  onAssignTask?: (taskId: string, employeeId: string) => void
  showCustomerInfo?: boolean
  employees?: Employee[]
  loadingEmployees?: boolean
  user: any
}

export function TaskList({
  onViewTask,
  onEditTask,
  onAddTask,
  onAssignTask,
  showCustomerInfo = true,
  employees = [],
  loadingEmployees = false,
  user
}: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [assignedTasks, setAssignedTasks] = useState<ExtendedTask[]>([])
  const [unassignedTasks, setUnassignedTasks] = useState<ExtendedTask[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingAssigned, setLoadingAssigned] = useState(true)
  const [loadingUnassigned, setLoadingUnassigned] = useState(true)
  const [loadingEmployeesState, setLoadingEmployeesState] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)
  // State for assignment functionality
  const [assigningTaskId, setAssigningTaskId] = useState<string | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [employeesState, setEmployeesState] = useState<Employee[]>([])
  // State for unassigned tasks section
  const [showUnassignedDetails, setShowUnassignedDetails] = useState(false)
  // State for refreshing task data
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Listen for refresh event
  useEffect(() => {
    const handleRefresh = () => {
      setRefreshTrigger(prev => prev + 1)
    }

    window.addEventListener('refreshTasks', handleRefresh)
    return () => {
      window.removeEventListener('refreshTasks', handleRefresh)
    }
  }, [])

  // Function to get employee name by ID
  const getEmployeeName = (employeeId: string) => {
    if (!employeeId || employeeId === "unassigned") return "Unassigned"

    const employee = employeesState.find(emp => emp.employee_id.toString() === employeeId)
    return employee ? employee.employee_name : "Unknown Employee"
  }

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployeesState(true)

        // Updated to use the employees API endpoint
        const response = await employeesApi.getAll()

        let transformedEmployees: Employee[] = []
        // First check if it's a paginated response with results property
        if (response && typeof response === 'object' && 'results' in response && Array.isArray(response.results)) {
          // Handle paginated response
          transformedEmployees = response.results.map((employee: any) => ({
            employee_id: employee.id,
            employee_name: employee.name
          }))
        } else if (response && Array.isArray(response)) {
          // Handle array response
          transformedEmployees = response.map((employee: any) => ({
            employee_id: employee.employee_id || employee.id,
            employee_name: employee.employee_name || employee.name
          }))
        } else {
          // Fallback to empty array
          transformedEmployees = []
        }

        setEmployeesState(transformedEmployees)
      } catch (err: any) {
        console.error("Fetch employees error:", err)
        setEmployeesState([])
      } finally {
        setLoadingEmployeesState(false)
      }
    }

    fetchEmployees()
  }, [])

  // Fetch assigned tasks from API
  useEffect(() => {
    const fetchAssignedTasks = async () => {
      try {
        setLoadingAssigned(true)

        // Updated to use the new assigned tasks endpoint
        const response = await tasksApi.getAssigned({ page: currentPage, page_size: 5 })

        // Handle different possible response structures
        let tasksData: any[] = []
        let paginationInfo: {
          count: number
          next: string | null
          previous: string | null
          totalPages: number
        } = {
          count: 0,
          next: null,
          previous: null,
          totalPages: 1
        }

        if (response && response.results) {
          tasksData = response.results
          paginationInfo = {
            count: response.count || tasksData.length,
            next: response.next || null,
            previous: response.previous || null,
            totalPages: Math.ceil((response.count || tasksData.length) / 5)
          }
        } else if (Array.isArray(response)) {
          tasksData = response
          paginationInfo = {
            count: response.length,
            next: null,
            previous: null,
            totalPages: 1
          }
        }

        if (tasksData && tasksData.length > 0) {
          // Transform backend data to match Task interface
          const transformedTasks: Task[] = tasksData.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description || "",
            customerId: task.customer?.id?.toString() || task.customer_id?.toString() || "",
            serviceId: task.service?.id?.toString() || task.service_id?.toString() || "",
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date || task.dueDate || "",
            createdAt: task.created_at || task.createdAt || new Date().toISOString(),
            updatedAt: task.updated_at || task.updatedAt,
            completedAt: task.completed_at || task.completedAt,
            subtasks: task.subtasks && Array.isArray(task.subtasks) ? task.subtasks.map((subtask: any) => ({
              id: subtask.id.toString(),
              title: subtask.title,
              description: subtask.description || "",
              completed: subtask.completed || false,
              assignedTo: subtask.assigned_to || "",
              requiresProof: subtask.requires_proof !== undefined ? subtask.requires_proof :
                subtask.requiresProof !== undefined ? subtask.requiresProof :
                  false,
              proofFiles: subtask.proof_file ? [subtask.proof_file] : [],
              additionalCost: subtask.additional_cost ? {
                amount: parseFloat(subtask.additional_cost),
                comment: subtask.additional_cost_notes || ""
              } : undefined
            })) : [],
            progress: task.progress || 0,
            base_price: task.base_price,
            customer: task.customer,
            service: task.service,
            customer_name: task.customer_name || (task.customer ? task.customer.name : ""),
            service_name: task.service_name || (task.service ? task.service.name : ""),
            assignedTo: task.assigned_to || task.assignedTo || "", // Handle both field names
            assigned_employee: task.assigned_employee || "" // Handle direct employee name from API
          }))
          setAssignedTasks(transformedTasks)
          setError(null)

          // Update pagination state
          setTotalCount(paginationInfo.count)
          setTotalPages(paginationInfo.totalPages)
          setHasNext(!!paginationInfo.next)
          setHasPrevious(!!paginationInfo.previous)
        } else {
          setAssignedTasks([])
          setError("Failed to fetch assigned tasks - no data received")
        }
      } catch (err: any) {
        setError("Error fetching assigned tasks: " + (err.message || err))
        console.error("Fetch assigned tasks error:", err)
        setAssignedTasks([])
      } finally {
        setLoadingAssigned(false)
        // Set overall loading state to false when both are done
        if (!loadingUnassigned) {
          setLoading(false)
        }
      }
    }

    fetchAssignedTasks()
  }, [currentPage, refreshTrigger])

  // Fetch unassigned tasks from API
  useEffect(() => {
    const fetchUnassignedTasks = async () => {
      try {
        setLoadingUnassigned(true)

        // Updated to use the new unassigned tasks endpoint
        const response = await tasksApi.getUnassigned({ page: 1, page_size: 10 })

        if (response && response.results && response.results.length > 0) {
          // Transform backend data to match Task interface
          const transformedTasks: Task[] = response.results.map((task: any) => ({
            ...task, // simplify transformation for now to avoid errors, we'll refine if needed
            id: task.id.toString(),
            title: task.title,
            description: task.description || "",
            customerId: task.customer?.id?.toString() || task.customer_id?.toString() || "",
            serviceId: task.service?.id?.toString() || task.service_id?.toString() || "",
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date || task.dueDate || "",
            createdAt: task.created_at || task.createdAt || new Date().toISOString(),
            updatedAt: task.updated_at || task.updatedAt,
            completedAt: task.completed_at || task.completedAt,
            subtasks: task.subtasks && Array.isArray(task.subtasks) ? task.subtasks.map((subtask: any) => ({
              id: subtask.id.toString(),
              title: subtask.title,
              description: subtask.description || "",
              completed: subtask.completed || false,
              assignedTo: subtask.assigned_to || "",
              requiresProof: subtask.requires_proof !== undefined ? subtask.requires_proof :
                subtask.requiresProof !== undefined ? subtask.requiresProof :
                  false,
              proofFiles: subtask.proof_file ? [subtask.proof_file] : [],
              additionalCost: subtask.additional_cost ? {
                amount: parseFloat(subtask.additional_cost),
                comment: subtask.additional_cost_notes || ""
              } : undefined
            })) : [],
            progress: task.progress || 0,
            base_price: task.base_price,
            customer: task.customer,
            service: task.service,
            customer_name: task.customer_name || (task.customer ? task.customer.name : ""),
            service_name: task.service_name || (task.service ? task.service.name : ""),
            assignedTo: task.assigned_to || task.assignedTo || "", // Handle both field names
            assigned_employee: task.assigned_employee || "" // Handle direct employee name from API
          }))
          setUnassignedTasks(transformedTasks)
          // Automatically expand if unassigned tasks exist
          setShowUnassignedDetails(true)
        } else {
          setUnassignedTasks([])
        }
      } catch (err: any) {
        console.error("Fetch unassigned tasks error:", err)
        setUnassignedTasks([])
      } finally {
        setLoadingUnassigned(false)
        // Set overall loading state to false when both are done
        if (!loadingAssigned) {
          setLoading(false)
        }
      }
    }

    fetchUnassignedTasks()
  }, [refreshTrigger])

  // Calculate task statistics
  const totalTasks = assignedTasks.length + unassignedTasks.length;
  const completedTasks = [...assignedTasks, ...unassignedTasks].filter(task => task.status === "completed");
  const inProgressTasks = [...assignedTasks, ...unassignedTasks].filter(task => task.status === "in-progress");
  const pendingTasks = [...assignedTasks, ...unassignedTasks].filter(task => task.status === "pending");
  const overdueTasks = [...assignedTasks, ...unassignedTasks].filter(task => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== "completed";
  });
  const highPriorityTasks = [...assignedTasks, ...unassignedTasks].filter(task => task.priority === "high" || task.priority === 3);
  const averageProgress = totalTasks > 0 ? Math.round([...assignedTasks, ...unassignedTasks].reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0;

  const filteredAssignedTasks = assignedTasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (task.customer_name && task.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.service_name && task.service_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority.toString() === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleAssignTask = async (taskId: string, employeeId: string) => {
    if (!employeeId) return;

    try {
      // If onAssignTask callback is provided, use it (from parent component)
      if (onAssignTask) {
        await onAssignTask(taskId, employeeId);
      } else {
        // Fallback to local implementation
        const token = "" // No auth for now

        // Find the task in unassigned tasks to get its subtasks data
        const taskToAssign = unassignedTasks.find(task => task.id === taskId);
        console.log("Task to assign:", taskToAssign);

        // Transform subtasks to the required subtasks_data format
        let subtasks_data: Array<{ title: string; description: string; requires_proof: boolean }> = [];
        if (taskToAssign && taskToAssign.subtasks && Array.isArray(taskToAssign.subtasks) && taskToAssign.subtasks.length > 0) {
          subtasks_data = taskToAssign.subtasks.map((subtask: any) => {
            // Handle different possible property names for requires_proof
            const requiresProof = subtask.requiresProof !== undefined ? subtask.requiresProof :
              subtask.requires_proof !== undefined ? subtask.requires_proof :
                false;

            return {
              title: subtask.title || "",
              description: subtask.description || "",
              requires_proof: requiresProof
            };
          });
        }

        console.log("Subtasks data being sent:", subtasks_data);

        // Call the assign function with subtasks_data
        const response = await tasksApi.assign(taskId, parseInt(employeeId), subtasks_data)
        console.log("Assign response:", response);
      }

      // Update the task in the local state without losing subtasks
      setUnassignedTasks(prevTasks =>
        prevTasks.map(task => {
          if (task.id === taskId) {
            // Create a new task object with the same properties but updated assignedTo
            return {
              ...task,
              assignedTo: employeeId
            };
          }
          return task;
        })
      )

      // Also remove the task from unassigned list since it's now assigned
      setUnassignedTasks(prevTasks => prevTasks.filter(task => task.id !== taskId))

      // Reset assignment state
      setAssigningTaskId(null)
      setSelectedEmployee("")

      // Show success message
      alert("Task assigned successfully!")
    } catch (error) {
      console.error("Error assigning task:", error)
      alert("Failed to assign task. Please try again.")
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "in-progress":
        return "bg-blue-50 text-blue-700 border-blue-100"
      case "pending":
        return "bg-amber-50 text-amber-700 border-amber-100"
      case "cancelled":
        return "bg-slate-100 text-slate-500 border-slate-200"
      default:
        return "bg-slate-50 text-slate-400 border-slate-100"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    const priorityValue = typeof priority === 'number' ? priority :
      priority === 'high' ? 3 :
        priority === 'medium' ? 2 : 1;

    switch (priorityValue) {
      case 3:
        return "bg-rose-50 text-rose-700 border-rose-100"
      case 2:
        return "bg-orange-50 text-orange-700 border-orange-100"
      case 1:
        return "bg-slate-50 text-slate-600 border-slate-200"
      default:
        return "bg-slate-50 text-slate-400 border-slate-100"
    }
  }

  const getDaysUntilDue = (dueDate: string): number => {
    if (!dueDate) return 0;
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Simplified class names to avoid complex template literals
  const getMobileClass = (mobileClass: string, desktopClass: string) => {
    return isMobile ? mobileClass : desktopClass
  }

  return (
    <div className="space-y-6 w-full overflow-hidden animate-in fade-in duration-700">
      {/* Unified Minimalist Analytics Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 rounded-full border border-slate-800 transition-all hover:scale-105">
          <Layers className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-black text-white uppercase tracking-tighter whitespace-nowrap">{totalTasks} Total</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 transition-all hover:scale-105">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span className="text-[11px] font-black text-emerald-700 uppercase tracking-tighter whitespace-nowrap">{completedTasks.length} Done</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 transition-all hover:scale-105">
          <Timer className="h-3.5 w-3.5 text-blue-600" />
          <span className="text-[11px] font-black text-blue-700 uppercase tracking-tighter whitespace-nowrap">{inProgressTasks.length} Active</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 rounded-full border border-rose-100 transition-all hover:scale-105">
          <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          <span className="text-[11px] font-black text-rose-700 uppercase tracking-tighter whitespace-nowrap">{pendingTasks.length} Pending</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full border border-red-100 transition-all hover:scale-105">
          <AlertTriangle className="h-3.5 w-3.5 text-red-600" />
          <span className="text-[11px] font-black text-red-700 uppercase tracking-tighter whitespace-nowrap">{overdueTasks.length} Overdue</span>
        </div>
      </div>

      {/* Unassigned Tasks Integrated Section */}
      {unassignedTasks.length > 0 && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-rose-50 bg-rose-50/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="font-semibold text-rose-900">Attention Required: Unassigned Tasks</h2>
              <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {unassignedTasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUnassignedDetails(!showUnassignedDetails)}
              className="text-rose-700 hover:bg-rose-100 h-8 px-2"
            >
              {showUnassignedDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {showUnassignedDetails && (
            <div className="divide-y divide-rose-50">
              {unassignedTasks.map((task) => (
                <div key={`unassigned-${task.id}`} className="p-5 sm:p-6 bg-rose-50/10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{task.title}</h3>
                        <div className={cn(
                          "px-1.5 py-0.5 rounded text-[10px] font-bold border uppercase",
                          getPriorityColor(task.priority)
                        )}>
                          {typeof task.priority === 'number' ? (task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low') : task.priority}
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-1">{task.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span className="font-medium text-slate-700">{task.customer_name || "Private"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          <span>{task.service_name || "General"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      {assigningTaskId === task.id ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                            <SelectTrigger className="h-9 w-full sm:w-[160px] bg-white border-rose-200 focus:ring-rose-500 rounded-lg text-sm text-slate-700">
                              <SelectValue placeholder="Assign user..." />
                            </SelectTrigger>
                            <SelectContent>
                              {employeesState.map((emp) => (
                                <SelectItem key={emp.employee_id} value={emp.employee_id.toString()}>
                                  {emp.employee_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            onClick={() => handleAssignTask(task.id, selectedEmployee)}
                            disabled={!selectedEmployee}
                            className="bg-rose-500 hover:bg-rose-600 text-white h-9 px-3 rounded-lg"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => { setAssigningTaskId(null); setSelectedEmployee(""); }}
                            className="text-slate-400 hover:text-slate-600 h-9 px-3"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : user.role === 'admin' && (
                        <Button
                          onClick={() => setAssigningTaskId(task.id)}
                          className="w-full sm:w-auto bg-slate-900 group-hover:bg-slate-800 text-white h-9 px-4 rounded-lg shadow-sm"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Assign Now
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Minimalist Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-10 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg text-xs font-bold uppercase text-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-[140px] h-10 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg text-xs font-bold uppercase text-slate-700">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Priority</SelectItem>
              <SelectItem value="3">High</SelectItem>
              <SelectItem value="2">Medium</SelectItem>
              <SelectItem value="1">Low</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
            }}
            className="h-10 w-10 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0"
            title="Reset Filters"
          >
            <RefreshCw className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Assigned Tasks Section - Redesigned to document-style rows */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold text-slate-800">Assigned Tasks</h2>
            <span className="bg-slate-200/60 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {filteredAssignedTasks.length}
            </span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {loadingAssigned ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredAssignedTasks.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                <Layers className="h-6 w-6 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-medium mb-1">No assigned tasks found</h3>
              <p className="text-slate-500 text-sm max-w-[240px] mx-auto mb-6">
                Try adjusting your search or filters to find what you're looking for.
              </p>
              {user.role === 'admin' && (
                <Button onClick={onAddTask} variant="outline" className="h-9 px-4 rounded-lg border-slate-200 hover:bg-slate-50">
                  <Plus className="h-4 w-4 mr-2" />
                  New Task
                </Button>
              )}
            </div>
          ) : (
            filteredAssignedTasks.map((task) => (
              <div
                key={`assigned-${task.id}`}
                onClick={() => onViewTask(task)}
                className="group p-5 sm:p-6 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-1.5 w-2 h-2 rounded-full flex-shrink-0",
                        task.status === "completed" ? "bg-emerald-400" :
                          task.status === "in-progress" ? "bg-blue-400" :
                            "bg-amber-400"
                      )} />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 leading-none group-hover:text-slate-800 transition-colors">
                          {task.title}
                        </h3>
                        <p className="text-slate-500 text-sm mt-2 line-clamp-1 leading-relaxed">
                          {task.description || "No description provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600 border border-slate-200/50">
                        <Building2 className="h-3 w-3" />
                        {task.service_name || "General Service"}
                      </div>

                      <div className={cn(
                        "px-2 py-0.5 rounded-md text-[11px] font-semibold border uppercase tracking-wider",
                        getPriorityColor(task.priority).split(' ').slice(0, 3).join(' ')
                      )}>
                        {typeof task.priority === 'number' ? (task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low') : task.priority}
                      </div>

                      {showCustomerInfo && (
                        <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                          <User className="h-3.5 w-3.5" />
                          <span className="font-medium truncate max-w-[120px]">
                            {task.customer_name || "Private"}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-slate-500 text-xs border-l border-slate-200 pl-3 ml-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</span>
                        {task.dueDate && getDaysUntilDue(task.dueDate) < 0 && task.status !== "completed" && (
                          <span className="text-rose-600 font-bold ml-1">!</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full max-w-md pt-1">
                      <div className="flex-1 overflow-hidden">
                        <Progress value={task.progress} className="h-1 bg-slate-100" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 tabular-nums">
                        {task.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto pt-4 sm:pt-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewTask(task)}
                      className="flex-1 sm:flex-none h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {user.role === 'admin' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditTask(task)}
                        className="flex-1 sm:flex-none h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Refined Pagination Controls */}
      {!loadingAssigned && filteredAssignedTasks.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mt-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{filteredAssignedTasks.length}</span> of <span className="text-slate-900">{totalCount}</span> Deliverables
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!hasPrevious || loadingAssigned}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Only show current, first, last, and neighbors
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={loadingAssigned}
                      className={cn(
                        "w-8 h-8 p-0 rounded-lg text-xs font-black transition-all",
                        pageNum === currentPage 
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={!hasNext || loadingAssigned}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
