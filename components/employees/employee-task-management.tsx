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
import { TaskDetails } from "@/components/tasks/task-details"
import { SubtaskEditor } from "@/components/tasks/subtask-editor"
import { Checkbox } from "@/components/ui/checkbox"
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
  UserPlus,
  RotateCcw
} from "lucide-react"
import { mockUsers, mockTasks, mockCustomers, mockServices } from "@/lib/auth"
import type { User as AuthUser } from "@/lib/auth"
import { tasksApi, customersApi, usersApi, employeesApi } from "@/lib/api"

interface EmployeeTaskManagementProps {
  employee: AuthUser
  onBack: () => void
  defaultEmployeeId?: string
  hideBack?: boolean
}

export function EmployeeTaskManagement({ employee, onBack, defaultEmployeeId, hideBack }: EmployeeTaskManagementProps) {
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
  const [loadingEmployeeTasks, setLoadingEmployeeTasks] = useState(false)
  const [showAssignedModal, setShowAssignedModal] = useState(false)
  // no modal for list

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
        const usersResponse = await usersApi.getAll()
        const employeeUsers = usersResponse.results?.filter((user: any) => user.role === 'employee') || []
        setEmployees(employeeUsers)
        
        // Fetch unassigned tasks
        const unassignedResponse = await tasksApi.getUnassigned({ page: 1, page_size: 20 })
        
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
        
        // Fetch employee tasks
        setLoadingEmployeeTasks(true)
        const employeeTasksResponse = await employeesApi.getTasks(employee.id)
        if (employeeTasksResponse && employeeTasksResponse.results) {
          const transformedEmployeeTasks = employeeTasksResponse.results.map((task: any) => ({
            id: task.id.toString(),
            title: task.title,
            description: task.description || "",
            status: task.status,
            priority: task.priority,
            dueDate: task.due_date,
            progress: task.progress || 0,
            customerId: task.customer?.id?.toString() || "",
            serviceId: task.service?.id?.toString() || "",
            customer_name: task.customer_name || "",
            service_name: task.service_name || "",
            assignedTo: employee.id,
            assigned_employee: task.assigned_employee || ""
          }))
          setEmployeeTasks(transformedEmployeeTasks)
        } else {
          setEmployeeTasks([])
        }
        
      } catch (error) {
        console.error("Error fetching data:", error)
        // Do not use any mock data; keep UI consistent with backend-only data
        setUnassignedTasks([])
        setEmployeeTasks([])
      } finally {
        setLoadingCustomers(false)
        setLoadingEmployees(false)
        setLoadingUnassignedTasks(false)
        setLoadingEmployeeTasks(false)
      }
    }

    fetchData()
  }, [])
  
  // Handler for viewing a task
  const handleViewTask = (task: any) => {
    // Ensure task has a valid subtasks array
    const taskWithSubtasks = {
      ...task,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
    };
    setSelectedTask(taskWithSubtasks)
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

  // Refresh employee tasks function
  const refreshEmployeeTasks = async () => {
    try {
      setLoadingEmployeeTasks(true)
      const employeeTasksResponse = await employeesApi.getTasks(employee.id)
      if (employeeTasksResponse && employeeTasksResponse.results) {
        const transformedEmployeeTasks = employeeTasksResponse.results.map((task: any) => ({
          id: task.id.toString(),
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          dueDate: task.due_date,
          progress: task.progress || 0,
          customerId: task.customer?.id?.toString() || "",
          serviceId: task.service?.id?.toString() || "",
          customer_name: task.customer_name || "",
          service_name: task.service_name || "",
          assignedTo: employee.id,
          assigned_employee: task.assigned_employee || ""
        }))
        setEmployeeTasks(transformedEmployeeTasks)
      } else {
        setEmployeeTasks([])
      }
    } catch (error) {
      console.error("Error refreshing employee tasks:", error)
    } finally {
      setLoadingEmployeeTasks(false)
    }
  }

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
        description: subtask.title || "", // Use title as description for consistency
        requires_proof: false, // Default to false
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
      const response = await tasksApi.create(taskData)
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
        subtasks_data = taskToAssign.subtasks.map((subtask: any) => ({
          title: subtask.title || "",
          description: subtask.title || "", // Use title as description for consistency
          requires_proof: false, // Default to false
        }));
      }
      
      console.log("Subtasks data being sent:", subtasks_data);
      
      // Call the assign function with subtasks_data
      const response = await tasksApi.assign(taskId, parseInt(employee.id), subtasks_data)
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

  const getPriorityColor = (priority: any) => {
    const priorityValue = typeof priority === 'number' ? priority : 
                         priority === 'high' ? 3 : 
                         priority === 'medium' ? 2 : 1;
    
    switch (priorityValue) {
      case 3:
        return "text-red-600 border-red-300 bg-red-50"
      case 2:
        return "text-orange-600 border-orange-300 bg-orange-50"
      case 1:
        return "text-green-600 border-green-300 bg-green-50"
      default:
        return "text-muted-foreground border-muted-foreground bg-muted/20"
    }
  }


  // Render the task view page when viewModeState is "view"
  if (activeTab === "view" && viewModeState === "view" && selectedTask) {
    return (
      <TaskDetails
        task={selectedTask}
        onBack={handleBackToList}
        onEdit={(task) => {}}
        allowSubtaskCreation={false}
        showTaskActions={false}
      />
    )
  }

  // View Tab - Task List
  if (activeTab === "view" && viewModeState === "list") {
  return (
    <div className="space-y-6 max-w-full overflow-hidden px-2 sm:px-0">
        {/* Enhanced Header */}
      <div className="relative max-w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
        <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-sm border rounded-xl max-w-full">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 max-w-full">
            {/* Back Button Section */}
            {!hideBack && (
              <Button
                variant="outline"
                onClick={onBack}
                className="bg-card hover:bg-muted/50 w-full sm:w-auto whitespace-nowrap"
              >
                <ArrowLeft className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Back to Employees</span>
              </Button>
            )}
            
            {/* Content Section */}
            <div className="flex items-center gap-4 max-w-full min-w-0">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Eye className="h-6 w-6 lg:h-8 lg:w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground mb-1 break-words max-w-full">
                    Task View - {employee.name}
                </h1>
                <p className="text-muted-foreground text-sm sm:text-base break-words max-w-full">
                    View and manage assigned tasks
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
                <Eye className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Task Viewing</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <ListTodo className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">Task Management</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground min-w-0">
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Performance Tracking</span>
            </div>
          </div>
        </div>
      </div>

        {/* Enhanced Filtering and Search */}
        <Card className="border-2 border-muted/50 shadow-md w-full overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filter & Search Tasks
                </CardTitle>
              </CardHeader>
          <CardContent className="pt-4 w-full">
            <div className="flex flex-col md:flex-row items-center gap-4 flex-wrap w-full">
              <div className="relative flex-1 min-w-[250px] w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                  placeholder="Search tasks by title, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 w-full"
                />
                      </div>
                      
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-40 h-11">
                    <SelectValue placeholder="Filter by Status" />
                          </SelectTrigger>
                          <SelectContent>
                    <SelectItem value="all">
                              <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        All Status
                              </div>
                            </SelectItem>
                    <SelectItem value="pending">
                              <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                        Pending
                              </div>
                            </SelectItem>
                    <SelectItem value="in-progress">
                              <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        In Progress
                              </div>
                            </SelectItem>
                    <SelectItem value="completed">
                                <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Completed
                                </div>
                              </SelectItem>
                          </SelectContent>
                        </Select>
                
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-full sm:w-40 h-11">
                    <SelectValue placeholder="Filter by Priority" />
                          </SelectTrigger>
                          <SelectContent>
                    <SelectItem value="all">
                                <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full" />
                        All Priority
                                </div>
                              </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                              <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full" />
                        Medium Priority
                              </div>
                            </SelectItem>
                    <SelectItem value="low">
                              <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        Low Priority
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 pt-4 border-t gap-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredTasks.length} of {employeeTasks.length} tasks
              </p>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshEmployeeTasks}
                  disabled={loadingEmployeeTasks}
                  className="h-8 px-3"
                >
                  <RotateCcw className={`h-4 w-4 mr-1 ${loadingEmployeeTasks ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BarChart3 className="h-4 w-4" />
                  <span>Total Tasks: {employeeTasks.length}</span>
                </div>
              </div>
            </div>
                  </CardContent>
                </Card>

        {/* Employee Tasks List - Inline (no modal) */}
        {employeeTasks.length > 0 && (
          <Card className="border-2 border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-100/50 to-indigo-100/50 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <ListTodo className="h-4 w-4 text-blue-600" />
                  </div>
                  <span>Assigned Tasks</span>
                  <Badge variant="default" className="text-xs">
                    {employeeTasks.length} tasks
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => {
                      const daysUntilDue = getDaysUntilDue(task.dueDate)
                      const isOverdue = daysUntilDue < 0
                      const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                      return (
                <Card key={`assigned-${task.id}`} className="hover:shadow-lg transition-all duration-200 border border-blue-200 group">
                    <CardHeader className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate group-hover:text-blue-600 transition-colors text-base">
                            {task.title}
                          </CardTitle>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              {task.service_name || task.service?.name || "No Service"}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {typeof task.priority === 'number' ? 
                                (task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low') : 
                                task.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                            <ListTodo className="h-4 w-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                        {task.description}
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-base font-bold text-blue-600">
                            <User className="h-5 w-5" />
                            <span className="truncate max-w-[150px]">
                              {task.customer_name || task.customer?.name || "No Customer"}
                            </span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getStatusColor(task.status)}`}
                          >
                            {task.status.replace('-', ' ')}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                          </span>
                          {task.dueDate && getDaysUntilDue(task.dueDate) < 0 && (
                            <Badge variant="destructive" className="text-xs py-0.5 px-1.5">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Progress</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{task.progress}%</span>
                            <div className="w-16 bg-muted rounded-full h-2">
                              <div 
                                className="bg-primary h-2 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">Subtasks</span>
                          </div>
                          <span className="text-sm font-medium">
                            {task.subtasks?.filter((st: any) => st.completed).length || 0} / {task.subtasks?.length || 0}
                          </span>
                        </div>
                        
                        <Button
                          onClick={() => handleViewTask(task)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                    </CardContent>
                  </Card>
                )
              })
            ) : null}
            </div>
          </CardContent>
        </Card>
        )}
        
        {employeeTasks.length === 0 && !loadingEmployeeTasks && (
          <Card className="border-2 border-dashed border-muted/50 w-full">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ListTodo className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                    </div>
                <h3 className="text-lg sm:text-xl font-semibold text-muted-foreground mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground">
                  {employeeTasks.length === 0 
                    ? "This employee doesn't have any tasks assigned yet." 
                    : "No tasks match your current filters."}
                </p>
                {searchTerm || filterStatus !== "all" || filterPriority !== "all" ? (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("")
                      setFilterStatus("all")
                      setFilterPriority("all")
                    }}
                    className="mt-4"
                  >
                    Clear Filters
                    </Button>
                ) : null}
            </CardContent>
          </Card>
        )}
        
        {loadingEmployeeTasks && (
          <Card className="border-2 border-muted/50 shadow-md w-full">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Loading employee tasks...</p>
            </CardContent>
          </Card>
        )}

        {/* No modal; details shown in dedicated view */}
      </div>
    )
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
                          onClick={() => {
            setActiveTab("view")
            setViewModeState("list")
                          }}
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
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <h3 className="text-2xl font-bold">{taskStats.total}</h3>
                  </div>
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <ListTodo className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-yellow-500/20 shadow-lg bg-gradient-to-br from-yellow-500/5 to-card max-w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <h3 className="text-2xl font-bold">{taskStats.pending}</h3>
                  </div>
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/20 shadow-lg bg-gradient-to-br from-blue-500/5 to-card max-w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                    <h3 className="text-2xl font-bold">{taskStats.inProgress}</h3>
                  </div>
                  <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-500/20 shadow-lg bg-gradient-to-br from-green-500/5 to-card max-w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Completed</p>
                    <h3 className="text-2xl font-bold">{taskStats.completed}</h3>
          </div>
                  <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-red-500/20 shadow-lg bg-gradient-to-br from-red-500/5 to-card max-w-full">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                    <h3 className="text-2xl font-bold">{taskStats.overdue}</h3>
                  </div>
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Tasks Preview */}
          <Card className="border-2 border-muted/50 shadow-md max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Tasks
                </CardTitle>
              </CardHeader>
            <CardContent>
              {employeeTasks.length > 0 ? (
                <div className="space-y-3 max-w-full">
                  {employeeTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors max-w-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-3 h-3 rounded-full ${
                          task.status === "completed" ? "bg-green-500" :
                          task.status === "in-progress" ? "bg-blue-500" :
                          task.status === "pending" ? "bg-yellow-500" : "bg-gray-500"
                      }`} />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      </div>
                      <Badge className={getStatusColor(task.status)} variant="secondary">
                        {task.status.replace("-", " ").toUpperCase()}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No tasks assigned to this employee yet</p>
                </div>
              )}
              </CardContent>
            </Card>
        </div>
      )}

      {/* Assign Tab */}
      {activeTab === "assign" && (
        <div className="space-y-6 max-w-full">
          {/* Mode Selection */}
          <Card className="border-2 border-muted/50 shadow-md max-w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Assign Task Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant={assignMode === "create" ? "default" : "outline"}
                  onClick={() => setAssignMode("create")}
                  className="flex flex-col items-center justify-center h-32 gap-2"
                >
                  <Plus className="h-6 w-6" />
                  <span>Create New Task</span>
                  <p className="text-xs text-muted-foreground text-center">
                    Create a new task and assign it to this employee
                  </p>
                </Button>
                <Button
                  variant={assignMode === "existing" ? "default" : "outline"}
                  onClick={() => setAssignMode("existing")}
                  className="flex flex-col items-center justify-center h-32 gap-2"
                >
                  <Layers className="h-6 w-6" />
                  <span>Assign Existing Task</span>
                  <p className="text-xs text-muted-foreground text-center">
                    Assign an unassigned task to this employee
                  </p>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Create New Task Mode */}
          {assignMode === "create" && (
            <Card className="border-2 border-muted/50 shadow-md max-w-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Create New Task
                      </CardTitle>
                  </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTask} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <Label htmlFor="title">Task Title</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => handleInputChange("title", e.target.value)}
                          placeholder="Enter task title"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                          placeholder="Enter task description"
                          rows={3}
                        />
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerId">Customer</Label>
                          <Select
                            value={formData.customerId}
                            onValueChange={(value) => handleInputChange("customerId", value)}
                          >
                            <SelectTrigger>
                            <SelectValue placeholder="Select customer" />
                          </SelectTrigger>
                          <SelectContent>
                              {customers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                        <div>
                          <Label htmlFor="priority">Priority</Label>
                          <Select
                            value={formData.priority}
                            onValueChange={(value) => handleInputChange("priority", value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="dueDate">Due Date</Label>
                        <Input
                          id="dueDate"
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => handleInputChange("dueDate", e.target.value)}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="price">Base Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleInputChange("price", e.target.value)}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Subtasks Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Subtasks</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSubtask}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add
                        </Button>
                      </div>
                      
                      <div className="space-y-3 max-h-96 overflow-y-auto p-2">
                        {subtasks.length > 0 ? (
                          subtasks.map((subtask, index) => (
                            <div key={subtask.id} className="flex items-start gap-2 p-3 border rounded-lg">
                              <Input
                                value={subtask.title}
                                onChange={(e) => updateSubtask(index, "title", e.target.value)}
                                placeholder="Subtask title"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubtask(index)}
                              >
                                <X className="h-4 w-4" />
                        </Button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4 text-muted-foreground">
                            <p>No subtasks added</p>
                            <p className="text-xs mt-1">Click "Add" to create subtasks</p>
                      </div>
                    )}
                        </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
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
                        });
                        setSubtasks([]);
                      }}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button type="submit" className="flex items-center gap-2">
                      <Save className="h-4 w-4" />
                      Create and Assign Task
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
                )}

           {/* Assign Existing Task Mode */}
           {assignMode === "existing" && (
              <div className="space-y-6 max-w-full">
               {unassignedTasks.length > 0 && (
                 <Card className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50 shadow-lg">
                   <CardHeader className="bg-gradient-to-r from-orange-100/50 to-amber-100/50 p-4">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                       <CardTitle className="flex items-center gap-2 text-lg">
                         <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center">
                           <UserPlus className="h-4 w-4 text-orange-600" />
                      </div>
                         <span>Unassigned Tasks</span>
                         <Badge variant="destructive" className="text-xs">
                           {unassignedTasks.length} tasks
                        </Badge>
                    </CardTitle>
                     </div>
                  </CardHeader>
                   <CardContent className="p-4 space-y-4">
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                       {unassignedTasks.map((task) => (
                         <Card key={`unassigned-${task.id}`} className="hover:shadow-lg transition-all duration-200 border border-orange-200 group">
                           <CardHeader className="p-4">
                             <div className="flex items-start justify-between gap-3">
                               <div className="min-w-0 flex-1">
                                 <CardTitle className="truncate group-hover:text-orange-600 transition-colors text-base">
                                   {task.title}
                                 </CardTitle>
                                 <div className="flex items-center gap-2 mt-2 flex-wrap">
                                   <Badge variant="outline" className="text-xs">
                                     {task.service_name || task.service?.name || "No Service"}
                                   </Badge>
                                   <Badge 
                                     variant="secondary" 
                                     className={`text-xs ${getPriorityColor(task.priority)}`}
                                   >
                                     {typeof task.priority === 'number' ? 
                                       (task.priority === 3 ? 'High' : task.priority === 2 ? 'Medium' : 'Low') : 
                                       task.priority}
                            </Badge>
                          </div>
                        </div>
                               <div className="flex-shrink-0">
                                 <div className="w-8 h-8 bg-orange-500/10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                                   <UserPlus className="h-4 w-4 text-orange-600" />
                        </div>
                      </div>
                    </div>
                           </CardHeader>
                           <CardContent className="p-4 pt-0">
                             <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed mb-3">
                               {task.description}
                             </p>
                             
                             <div className="space-y-3">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2 text-base font-bold text-blue-600">
                                   <User className="h-5 w-5" />
                                   <span className="truncate max-w-[150px]">
                                     {task.customer_name || task.customer?.name || "No Customer"}
                                   </span>
                        </div>
                                 <Badge 
                                   variant="outline" 
                                   className={`text-xs ${getStatusColor(task.status)}`}
                                 >
                                   {task.status.replace('-', ' ')}
                        </Badge>
                    </div>
                               
                               <div className="flex items-center gap-2">
                                 <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                 <span className="text-sm text-muted-foreground">
                                   Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                                 </span>
                                 {task.dueDate && getDaysUntilDue(task.dueDate) < 0 && (
                                   <Badge variant="destructive" className="text-xs py-0.5 px-1.5">
                                     Overdue
                                  </Badge>
                                )}
                              </div>
                               
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <Target className="h-4 w-4 text-muted-foreground" />
                                   <span className="text-sm text-muted-foreground">Progress</span>
                                  </div>
                                 <div className="flex items-center gap-2">
                                   <span className="text-sm font-medium">{task.progress}%</span>
                                   <div className="w-16 bg-muted rounded-full h-2">
                                     <div 
                                       className="bg-primary h-2 rounded-full transition-all"
                                       style={{ width: `${task.progress}%` }}
                                     />
                                </div>
                                  </div>
                                </div>
                               
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center gap-2">
                                   <Building2 className="h-4 w-4 text-muted-foreground" />
                                   <span className="text-sm text-muted-foreground">Subtasks</span>
                                  </div>
                                 <span className="text-sm font-medium">
                                   {task.subtasks?.filter((st: any) => st.completed).length || 0} / {task.subtasks?.length || 0}
                                 </span>
                            </div>
                            
                                <Button
                                  onClick={() => handleAssignExistingTask(task.id)}
                                 className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                               >
                                 <UserPlus className="h-4 w-4 mr-2" />
                                 Assign to {employee.name}
                                </Button>
                    </div>
                  </CardContent>
                </Card>
                       ))}
                    </div>
                  </CardContent>
                </Card>
               )}
               
               {unassignedTasks.length === 0 && !loadingUnassignedTasks && (
                 <Card className="border-2 border-muted/50 shadow-md max-w-full">
                   <CardContent className="p-8 text-center">
                     <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                     <h3 className="font-semibold mb-1">No Unassigned Tasks</h3>
                     <p className="text-muted-foreground mb-4">
                       All tasks are currently assigned. Create a new task to assign.
                     </p>
                        <Button
                          variant="outline"
                       onClick={() => setAssignMode("create")}
                     >
                       Create New Task
                        </Button>
                    </CardContent>
                  </Card>
               )}
               
               {loadingUnassignedTasks && (
                 <Card className="border-2 border-muted/50 shadow-md max-w-full">
                   <CardContent className="p-8 text-center">
                     <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                     <p className="text-muted-foreground">Loading unassigned tasks...</p>
                </CardContent>
              </Card>
            )}
          </div>
           )}
        </div>
      )}
      
    </div>
  );
}

export default EmployeeTaskManagement;
