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
  AlertTriangle
} from "lucide-react"
import { mockTasks, mockUsers, type Task } from "@/lib/auth"

interface TaskListProps {
  onViewTask: (task: Task) => void
  onEditTask: (task: Task) => void
  onAddTask: () => void
  onAssignTask?: (taskId: string, employeeId: string) => void
  showCustomerInfo?: boolean
}

export function TaskList({ onViewTask, onEditTask, onAddTask, onAssignTask, showCustomerInfo = true }: TaskListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [tasks] = useState<Task[]>(mockTasks)
  const [showUnassigned, setShowUnassigned] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === "completed");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const pendingTasks = tasks.filter(task => task.status === "pending");
  const overdueTasks = tasks.filter(task => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    return dueDate < today && task.status !== "completed";
  });
  const unassignedTasks = tasks.filter(task => !task.assignedTo || task.assignedTo === "");
  const highPriorityTasks = tasks.filter(task => task.priority === "high");
  const averageProgress = totalTasks > 0 ? Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / totalTasks) : 0;

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    const matchesAssignment = showUnassigned ? (!task.assignedTo || task.assignedTo === "") : true
    return matchesSearch && matchesStatus && matchesPriority && matchesAssignment
  })

  const handleAssignTask = (taskId: string, employeeId: string) => {
    if (onAssignTask) {
      onAssignTask(taskId, employeeId)
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "bg-secondary text-secondary-foreground"
      case "in-progress":
        return "bg-primary text-primary-foreground"
      case "pending":
        return "bg-yellow-500 text-white"
      case "cancelled":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "text-red-600 border-red-300 bg-red-50"
      case "medium":
        return "text-orange-600 border-orange-300 bg-orange-50"
      case "low":
        return "text-green-600 border-green-300 bg-green-50"
      default:
        return "text-muted-foreground border-muted-foreground bg-muted/20"
    }
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Enhanced Header */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
        <div className="relative p-3 sm:p-4 lg:p-6 bg-card/80 backdrop-blur-sm border rounded-xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12 lg:w-16 lg:h-16'} bg-gradient-to-br from-secondary to-secondary/70 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                <Layers className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6 lg:h-8 lg:w-8'} text-secondary-foreground`} />
              </div>
              <div className="flex-1 min-w-0 overflow-hidden">
                <h1 className={`${isMobile ? 'text-xl' : 'text-2xl lg:text-3xl'} font-bold text-card-foreground mb-1 lg:mb-2 break-words`}>Task Management</h1>
                <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-base lg:text-lg'} hidden sm:block break-words`}>Comprehensive task tracking and assignment system</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button onClick={onAddTask} className={`flex items-center gap-2 shadow-lg w-full sm:w-auto ${isMobile ? 'h-10 px-4 text-sm' : 'h-11 lg:h-12 px-4 lg:px-6 text-sm lg:text-base'}`}>
                <Plus className="h-5 w-5 flex-shrink-0" />
                <span className="whitespace-nowrap">Add New Task</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline break-words">Team Coordination</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline break-words">Resource Management</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span className="hidden sm:inline break-words">Progress Tracking</span>
            </div>
          </div>
        </div>
      </div>

      {/* Task Statistics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4 w-full">
        <Card className="border-2 border-primary/20 shadow-lg bg-gradient-to-br from-primary/5 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <Layers className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-primary flex-shrink-0`} />
              <span className="hidden sm:inline">Total Tasks</span>
              <span className="sm:hidden">Total</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-primary`}>{totalTasks}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>All tasks</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <Timer className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-orange-600 flex-shrink-0`} />
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">Wait</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-orange-600`}>{pendingTasks.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>Awaiting start</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <CheckCircle2 className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-blue-600 flex-shrink-0`} />
              <span className="hidden sm:inline">Active</span>
              <span className="sm:hidden">Work</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-blue-600`}>{inProgressTasks.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>In progress</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-secondary/20 shadow-lg bg-gradient-to-br from-secondary/5 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <CheckCircle2 className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-secondary flex-shrink-0`} />
              <span className="hidden sm:inline">Completed</span>
              <span className="sm:hidden">Done</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-secondary`}>{completedTasks.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>Finished</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-red-50 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <AlertCircle className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-red-600 flex-shrink-0`} />
              <span className="hidden sm:inline">Overdue</span>
              <span className="sm:hidden">Late</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-red-600`}>{overdueTasks.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-card">
          <CardHeader className={`pb-2 ${isMobile ? 'p-2' : 'p-3 lg:p-4'}`}>
            <CardTitle className={`${isMobile ? 'text-xs' : 'text-sm lg:text-sm'} flex items-center gap-1 sm:gap-2`}>
              <UserPlus className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3 lg:h-4 lg:w-4'} text-orange-600 flex-shrink-0`} />
              <span className="hidden sm:inline">Unassigned</span>
              <span className="sm:hidden">Need</span>
            </CardTitle>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-4'} pt-0`}>
            <div className={`${isMobile ? 'text-lg' : 'text-xl lg:text-2xl'} font-bold text-orange-600`}>{unassignedTasks.length}</div>
            <p className={`${isMobile ? 'text-xs' : 'text-xs lg:text-xs'} text-muted-foreground`}>Need assignment</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filtering */}
      <Card className="border-2 border-muted/50 shadow-md w-full">
        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent pb-4">
          <CardTitle className={`flex items-center gap-2 ${isMobile ? 'text-base' : 'text-lg lg:text-lg'}`}>
            <Filter className="h-5 w-5 flex-shrink-0" />
            <span>Filter & Search Tasks</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 w-full">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`pl-10 ${isMobile ? 'h-10' : 'h-10 lg:h-11'} w-full`}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`w-full ${isMobile ? 'h-10' : 'h-10 lg:h-11'}`}>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                      All Status
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                      Pending
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="completed">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      Completed
                    </div>
                  </SelectItem>
                  <SelectItem value="cancelled">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      Cancelled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className={`w-full ${isMobile ? 'h-10' : 'h-10 lg:h-11'}`}>
                  <SelectValue placeholder="All Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0" />
                      All Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      High Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0" />
                      Medium Priority
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      Low Priority
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t gap-2">
            <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              Showing {filteredTasks.length} of {totalTasks} tasks
            </p>
            <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground`}>
              <BarChart3 className="h-4 w-4 flex-shrink-0" />
              <span className="hidden sm:inline">Average Progress: {averageProgress}%</span>
              <span className="sm:hidden">{averageProgress}% avg</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unassigned Tasks Section */}
      {unassignedTasks.length > 0 && (
        <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50/50 to-card">
          <CardHeader className="bg-gradient-to-r from-orange-100/50 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className={`flex items-center gap-3 ${isMobile ? 'text-lg' : 'text-xl'}`}>
                <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <AlertTriangle className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} flex-shrink-0`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`font-bold ${isMobile ? 'text-lg' : 'text-xl'}`}>Unassigned Tasks</div>
                  <Badge variant="outline" className={`bg-orange-100 text-orange-700 border-orange-300 ${isMobile ? 'text-xs mt-1' : 'text-sm'}`}>
                    {unassignedTasks.length} tasks need assignment
                  </Badge>
                </div>
              </CardTitle>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                onClick={() => setShowUnassigned(!showUnassigned)}
                className={`bg-orange-50 border-orange-200 hover:bg-orange-100 ${isMobile ? 'w-full' : 'w-auto'}`}
              >
                {showUnassigned ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            <p className={`text-muted-foreground mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
              These tasks require employee assignment before work can begin
            </p>
          </CardHeader>
          
          {showUnassigned && (
            <CardContent className={`space-y-4 ${isMobile ? 'p-3' : 'p-4 lg:p-6'}`}>
              {unassignedTasks.map((task) => {
                const daysUntilDue = getDaysUntilDue(task.dueDate)
                const isOverdue = daysUntilDue < 0
                const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                return (
                  <div key={task.id} className={`${isMobile ? 'p-3' : 'p-3 sm:p-4'} bg-card border-2 border-orange-200 rounded-lg hover:shadow-md transition-all`}>
                    <div className="flex flex-col gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 mb-3">
                          <h4 className={`${isMobile ? 'text-sm' : 'text-base lg:text-lg'} font-semibold text-card-foreground`}>{task.title}</h4>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={`${getPriorityColor(task.priority)} ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                              {task.priority.toUpperCase()}
                            </Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className={`animate-pulse ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                                <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                OVERDUE
                              </Badge>
                            )}
                            {isDueSoon && !isOverdue && (
                              <Badge variant="outline" className={`border-orange-300 text-orange-600 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                                <Timer className="h-3 w-3 mr-1 flex-shrink-0" />
                                DUE SOON
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className={`text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} mb-3`}>{task.description}</p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Due Date</p>
                              <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>{new Date(task.dueDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Customer</p>
                              <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>Customer #{task.customerId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium capitalize`}>{task.status}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 w-full">
                        <Select onValueChange={(employeeId) => handleAssignTask(task.id, employeeId)}>
                          <SelectTrigger className={`${isMobile ? 'h-10' : 'h-10'} bg-primary/5 border-primary/20 w-full`}>
                            <SelectValue placeholder="Select Employee" />
                          </SelectTrigger>
                          <SelectContent>
                            {mockUsers
                              .filter(user => user.role === 'employee')
                              .map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                      <User className="h-3 w-3 text-primary flex-shrink-0" />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium">{employee.name}</p>
                                      <p className="text-xs text-muted-foreground">{employee.email}</p>
                                    </div>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        
                        <Button
                          variant="outline"
                          size={isMobile ? "sm" : "default"}
                          onClick={() => onViewTask(task)}
                          className="w-full bg-secondary/5 border-secondary/20 hover:bg-secondary/10"
                        >
                          <Eye className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className={isMobile ? "text-sm" : ""}>View Details</span>
                        </Button>
                      </div>
                    </div>
                    
                    {/* Urgency Indicator */}
                    <div className="flex flex-col gap-3 pt-3 border-t border-orange-200">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            isOverdue ? 'bg-red-500 animate-pulse' : 
                            isDueSoon ? 'bg-orange-500' : 
                            'bg-green-500'
                          }`} />
                          <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>
                            {isOverdue 
                              ? `${Math.abs(daysUntilDue)} days overdue` 
                              : `${daysUntilDue} days remaining`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>
                            {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length} subtasks
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-muted-foreground`}>Assignment Priority:</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs w-fit ${
                            isOverdue ? 'border-red-300 text-red-600 bg-red-50' :
                            isDueSoon ? 'border-orange-300 text-orange-600 bg-orange-50' :
                            task.priority === 'high' ? 'border-red-300 text-red-600 bg-red-50' :
                            'border-blue-300 text-blue-600 bg-blue-50'
                          }`}
                        >
                          {isOverdue ? 'URGENT' : isDueSoon ? 'HIGH' : task.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              <div className={`${isMobile ? 'p-3' : 'p-3 sm:p-4'} bg-orange-50 border border-orange-200 rounded-lg`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                    <UserPlus className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4 sm:h-5 sm:w-5'} flex-shrink-0`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-semibold text-orange-800 mb-1 ${isMobile ? 'text-xs' : 'text-sm sm:text-base'}`}>Quick Assignment Tips</h4>
                    <ul className={`text-orange-700 space-y-1 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                      <li>• Assign high-priority and overdue tasks first</li>
                      <li>• Consider employee workload and expertise</li>
                      <li>• Tasks with approaching deadlines need immediate attention</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Enhanced Task Cards */}
      <div className="grid gap-3 sm:gap-4 lg:gap-6">
        {filteredTasks.map((task) => {
          const daysUntilDue = getDaysUntilDue(task.dueDate)
          const isOverdue = daysUntilDue < 0
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

          return (
            <Card key={task.id} className="group hover:shadow-xl transition-all duration-300 border-2 border-muted/50 hover:border-primary/30">
              <CardContent className={`${isMobile ? 'p-3' : 'p-4 lg:p-6'}`}>
                {/* Card Header */}
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 mb-3">
                      <h3 className={`${isMobile ? 'text-base' : 'text-lg lg:text-xl'} font-bold text-card-foreground group-hover:text-primary transition-colors`}>
                        {task.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={`${getStatusColor(task.status)} ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`} variant="secondary">
                          {task.status.replace("-", " ").toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={`${getPriorityColor(task.priority)} ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                          {task.priority.toUpperCase()}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive" className={`bg-red-500 text-white animate-pulse ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                            OVERDUE
                          </Badge>
                        )}
                      </div>
                    </div>
                    <p className={`text-muted-foreground mb-4 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} leading-relaxed`}>
                      {task.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full">
                    <Button
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      onClick={() => onViewTask(task)}
                      className="flex items-center gap-2 bg-primary/5 hover:bg-primary/10 border-primary/20 hover:border-primary/40 w-full"
                    >
                      <Eye className="h-4 w-4 flex-shrink-0" />
                      <span className={isMobile ? "text-sm" : ""}>View</span>
                    </Button>
                    <Button
                      variant="outline"
                      size={isMobile ? "sm" : "default"}
                      onClick={() => onEditTask(task)}
                      className="flex items-center gap-2 bg-secondary/5 hover:bg-secondary/10 border-secondary/20 hover:border-secondary/40 w-full"
                    >
                      <Edit className="h-4 w-4 flex-shrink-0" />
                      <span className={isMobile ? "text-sm" : ""}>Edit</span>
                    </Button>
                  </div>
                </div>

                {/* Task Metadata Grid */}
                <div className={`grid gap-3 mb-4 ${showCustomerInfo ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} rounded-full flex items-center justify-center flex-shrink-0 ${
                      isOverdue ? 'bg-red-100 text-red-600' : 
                      isDueSoon ? 'bg-orange-100 text-orange-600' : 
                      'bg-blue-100 text-blue-600'
                    }`}>
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>{new Date(task.dueDate).toLocaleDateString()}</p>
                      {isOverdue ? (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>{Math.abs(daysUntilDue)} days overdue</span>
                        </p>
                      ) : isDueSoon ? (
                        <p className="text-xs text-orange-600 font-medium flex items-center gap-1">
                          <AlertCircle className="h-3 w-3 flex-shrink-0" />
                          <span>Due in {daysUntilDue} days</span>
                        </p>
                      ) : (
                        <p className="text-xs text-green-600 font-medium">
                          {daysUntilDue} days remaining
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <User className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assigned To</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>Employee #{task.assignedTo}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                  
                  {showCustomerInfo && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Customer</p>
                        <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>Customer #{task.customerId}</p>
                        <p className="text-xs text-muted-foreground">Service #{task.serviceId}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                    <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0`}>
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Subtasks</p>
                      <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>
                        {task.subtasks.filter((st) => st.completed).length} of {task.subtasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground">completed</p>
                    </div>
                  </div>
                  
                  {/* Show completedAt for completed tasks */}
                  {task.status === "completed" && task.completedAt && (
                    <div className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg">
                      <div className={`${isMobile ? 'w-8 h-8' : 'w-8 h-8 sm:w-10 sm:h-10'} bg-secondary/20 text-secondary rounded-full flex items-center justify-center flex-shrink-0`}>
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Completed</p>
                        <p className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium`}>
                          {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">at {new Date(task.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Section */}
                <div className={`space-y-2 ${isMobile ? 'space-y-2' : 'space-y-2 lg:space-y-3'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-medium text-muted-foreground`}>Task Progress</span>
                    <span className={`${isMobile ? 'text-xs' : 'text-xs sm:text-sm'} font-bold text-primary`}>{task.progress}%</span>
                  </div>
                  <div className={`w-full bg-muted/30 rounded-full ${isMobile ? 'h-2' : 'h-2 lg:h-3'}`}>
                    <div 
                      className={`${isMobile ? 'h-2' : 'h-2 lg:h-3'} rounded-full transition-all duration-500 ${
                        task.progress === 100 ? 'bg-secondary' : 
                        task.progress > 50 ? 'bg-primary' : 
                        'bg-orange-500'
                      }`}
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTasks.length === 0 && (
        <Card>
          <CardContent className={`${isMobile ? 'p-4 sm:p-6' : 'p-6 lg:p-8'} text-center`}>
            <div className={`${isMobile ? 'w-16 h-16' : 'w-16 h-16 sm:w-20 sm:h-20'} bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Layers className={`${isMobile ? 'h-8 w-8' : 'h-8 w-8 sm:h-10 sm:w-10'} text-muted-foreground`} />
            </div>
            <h3 className={`${isMobile ? 'text-base' : 'text-base lg:text-lg'} font-semibold text-muted-foreground mb-2`}>No Tasks Found</h3>
            <p className={`text-muted-foreground ${isMobile ? 'text-sm' : 'text-sm lg:text-base'}`}>No tasks found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}