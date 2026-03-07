"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { UnifiedTaskView } from "@/components/tasks/unified-task-view"
import { SubtaskEditor } from "@/components/tasks/subtask-editor"
import {
  Plus,
  X,
  Save,
  ArrowLeft,
  FileText,
  User,
  Building2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Target,
  Settings,
  Eye,
  BarChart3,
  Loader2,
  Search,
  Filter,
  Clock,
  AlertTriangle,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  TrendingUp,
  ListTodo,
  Timer,
  Award,
  Users,
  Layers,
  UserPlus
} from "lucide-react"
import { mockUsers, mockTasks, mockCustomers, mockServices } from "@/lib/auth"
import type { User as AuthUser } from "@/lib/auth"
import { tasksApi, customersApi, usersApi } from "@/lib/api"

interface EmployeeTaskManagementProps {
  employee: AuthUser
  onBack: () => void
}

export function EmployeeTaskManagement({ employee, onBack }: EmployeeTaskManagementProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "assign" | "view">("overview")
  const [viewModeState, setViewModeState] = useState<"list" | "view">("list")
  const [assignMode, setAssignMode] = useState<"create" | "existing">("create")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [showTaskDetails, setShowTaskDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  // Enhanced task form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    customerId: "",
    serviceId: "",
    assignedTo: employee.id,
    status: "pending",
    priority: "medium",
    dueDate: "",
    price: "",
  })
  
  const [subtasks, setSubtasks] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [loadingCustomers, setLoadingCustomers] = useState(true)
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [unassignedTasks, setUnassignedTasks] = useState<any[]>([])
  const [loadingUnassignedTasks, setLoadingUnassignedTasks] = useState(true)
  const [employeeTasks, setEmployeeTasks] = useState<any[]>([])

  // Get employee's tasks from mock data (will be replaced with API call)
  const mockEmployeeTasks = mockTasks.filter(task => task.assignedTo === employee.id)

  // Fetch customers, employees, and unassigned tasks
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingCustomers(true)
        setLoadingEmployees(true)
        setLoadingUnassignedTasks(true)
        
        // Fetch customers
        const customersResponse = await customersApi.getAll()
        setCustomers(customersResponse.results || [])
        
        // Fetch employees (users with role 'employee')
        const usersResponse = await usersApi.getAll("")
        const employeeUsers = usersResponse.users?.filter((user: any) => user.role === 'employee') || []
        setEmployees(employeeUsers)
        
        // Fetch unassigned tasks
        const unassignedResponse = await tasksApi.getUnassigned("", { page: 1, page_size: 20 })
        
        if (unassignedResponse && unassignedResponse.results && unassignedResponse.results.length > 0) {
          // Transform backend data to match Task interface
          const transformedTasks = unassignedResponse.results.map((task: any) => ({
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
            assignedTo: task.assigned_to || task.assignedTo || "",
            assigned_employee: task.assigned_employee || ""
          }))
          setUnassignedTasks(transformedTasks)
        } else {
          setUnassignedTasks([])
        }
        
        // Set employee tasks from mock data for now
        setEmployeeTasks(mockEmployeeTasks)
        
      } catch (error) {
        console.error("Error fetching data:", error)
        // Fallback to mock data
        setCustomers(mockCustomers)
        setEmployees(mockUsers.filter(user => user.role === 'employee'))
        setUnassignedTasks(mockTasks.filter(task => !task.assignedTo || task.assignedTo === ""))
        setEmployeeTasks(mockEmployeeTasks)
      } finally {
        setLoadingCustomers(false)
        setLoadingEmployees(false)
        setLoadingUnassignedTasks(false)
      }
    }

    fetchData()
  }, [])
  
  // Handler for viewing a task
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setViewModeState("view")
  }

  // Handler for going back to the task list
  const handleBackToList = () => {
    setSelectedTask(null)
    setViewModeState("list")
  }

  // Filter tasks based on search and filters
  const filteredTasks = employeeTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || task.status === filterStatus
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Task statistics
  const taskStats = {
    total: employeeTasks.length,
    pending: employeeTasks.filter(t => t.status === "pending").length,
    inProgress: employeeTasks.filter(t => t.status === "in-progress").length,
    completed: employeeTasks.filter(t => t.status === "completed").length,
    overdue: employeeTasks.filter(t => {
      const today = new Date()
      const dueDate = new Date(t.dueDate)
      return dueDate < today && t.status !== "completed"
    }).length
  }

  const handleInputChange = (field: string, value: string) => {
    // For price field, we want to ensure it's handled as a number
    if (field === "price") {
      // Allow empty string or valid numbers
      if (value === "" || !isNaN(parseFloat(value))) {
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
      return
    }
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addSubtask = () => {
    const newSubtask = {
      id: Date.now().toString(),
      title: "",
      completed: false,
      assignedTo: employee.id,
      requiresProof: false,
      proofFiles: [] as File[],
    }
    setSubtasks([...subtasks, newSubtask])
  }

  const removeSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  const updateSubtask = (index: number, field: string, value: any) => {
    const updatedSubtasks = subtasks.map((subtask, i) => (i === index ? { ...subtask, [field]: value } : subtask))
    setSubtasks(updatedSubtasks)
  }

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Transform subtasks to the required subtasks_data format
      const subtasks_data = subtasks.map((subtask: any) => ({
        title: subtask.title || "",
        description: subtask.description || "",
        requires_proof: subtask.requiresProof !== undefined ? subtask.requiresProof : 
                      subtask.requires_proof !== undefined ? subtask.requires_proof : 
                      false,
      }))
      
      // Prepare task data
      const taskData = {
        title: formData.title,
        description: formData.description,
        customer_id: parseInt(formData.customerId),
        status: formData.status,
        priority: formData.priority === "low" ? 1 : formData.priority === "medium" ? 2 : 3,
        due_date: formData.dueDate,
        progress: 0,
        base_price: formData.price || "0.00",
        assigned_to_id: parseInt(employee.id),
        subtasks_data: subtasks_data
      }
      
      // Make API call to create task
      const token = "" // No auth for now
      const response = await tasksApi.create(token, taskData)
      console.log("Task created successfully:", response)
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        customerId: "",
        serviceId: "",
        assignedTo: employee.id,
        status: "pending",
        priority: "medium",
        dueDate: "",
        price: "",
      })
      setSubtasks([])
      
      // Show success message
      alert("Task created and assigned successfully!")
    } catch (error) {
      console.error("Error creating task:", error)
      alert("Failed to create task. Please try again.")
    }
  }

  const handleAssignExistingTask = async (taskId: string) => {
    try {
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
      const token = "" // No auth for now
      const response = await tasksApi.assign(token, taskId, employee.id, subtasks_data)
      console.log("Assign response:", response);
      
      // Update the local state - remove from unassigned and add to employee tasks
      setUnassignedTasks(prev => prev.filter(task => task.id !== taskId))
      setEmployeeTasks(prev => [...prev, { ...taskToAssign, assignedTo: employee.id }])
      
      // Show success message
      alert(`Task "${taskToAssign?.title}" has been successfully assigned to ${employee.name}!`)
      
    } catch (error) {
      console.error("Error assigning task:", error)
      alert("Failed to assign task. Please try again.")
    }
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-secondary text-secondary-foreground"
      case "in-progress": return "bg-primary text-primary-foreground"
      case "pending": return "bg-yellow-500 text-yellow-50"
      case "cancelled": return "bg-destructive text-destructive-foreground"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 border-red-300 bg-red-50"
      case "medium": return "text-orange-600 border-orange-300 bg-orange-50"
      case "low": return "text-green-600 border-green-300 bg-green-50"
      default: return "text-muted-foreground border-muted-foreground bg-muted/20"
    }
  }

  return (
    <div className="space-y-6 max-w-full overflow-hidden px-2 sm:px-0">
      {/* Enhanced Header - Refactored for better responsiveness and cleaner structure */}
      <div className="relative max-w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
        <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-sm border rounded-xl max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full">
            {/* Back Button Section */}
            <Button
              variant="outline"
              onClick={onBack}
              className="bg-card hover:bg-muted/50 w-full sm:w-auto whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">Back to Employees</span>
            </Button>
            
            {/* Content Section */}
            <div className="flex items-center gap-4 max-w-full min-w-0">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Target className="h-6 w-6 lg:h-8 lg:w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground mb-1 break-words max-w-full">
                  Task Management - {employee.name}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base break-words max-w-full">
                  Assign and manage tasks for this employee
                </p>
              </div>
            </div>
            
            {/* Employee Info Section */}
            <div className="flex items-center gap-3 max-w-full min-w-0">
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-primary/20 flex-shrink-0">
                <AvatarImage src={employee.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                  {employee.name.split(" ").map(n => n[0]).join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm sm:text-base truncate">{employee.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{employee.email}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-muted/30 text-sm max-w-full">
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <Users className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Employee Management</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <ListTodo className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Task Assignment</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Performance Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Refactored for better responsiveness */}
      <div className={`grid ${isMobile ? 'grid-cols-3 gap-2' : 'grid-cols-3 gap-4'} max-w-full`}>
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          size={isMobile ? "sm" : "default"}
          className="flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <BarChart3 className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
          <span className={`${isMobile ? "text-xs" : "text-sm"} truncate`}>Overview</span>
        </Button>
        <Button
          variant={activeTab === "assign" ? "default" : "outline"}
          onClick={() => setActiveTab("assign")}
          size={isMobile ? "sm" : "default"}
          className="flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Plus className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
          <span className={`${isMobile ? "text-xs" : "text-sm"} truncate`}>Assign</span>
        </Button>
        <Button
          variant={activeTab === "view" ? "default" : "outline"}
          onClick={() => setActiveTab("view")}
          size={isMobile ? "sm" : "default"}
          className="flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <Eye className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} flex-shrink-0`} />
          <span className={`${isMobile ? "text-xs" : "text-sm"} truncate`}>View</span>
        </Button>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6 max-w-full">
          {/* Task Statistics - Refactored for better responsiveness */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-full">
            <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-card max-w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ListTodo className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="truncate">Total Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{taskStats.total}</div>
                <p className="text-xs text-muted-foreground">All assigned</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-card max-w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Timer className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <span className="truncate">Pending</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{taskStats.pending}</div>
                <p className="text-xs text-muted-foreground">Not started</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-card max-w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">In Progress</span>
                </CardTitle>
