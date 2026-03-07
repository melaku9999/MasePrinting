"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TaskDetails } from "@/components/tasks/task-details"
import { TaskForm } from "@/components/tasks/task-form"
import { TaskCalendar } from "@/components/tasks/task-calendar"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  Target,
  ArrowRight,
  LayoutGrid,
  List,
  TrendingUp,
  MoreVertical,
  ChevronDown,
  Plus
} from "lucide-react"
import { cn } from "@/lib/utils"
import { tasksApi, employeesApi } from "@/lib/api"
import { mapBackendTaskToFrontend } from "@/lib/task-utils"
import type { User as AuthUser } from "@/lib/auth"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"

interface SharedTaskInterfaceProps {
  user: AuthUser
  viewMode?: "admin" | "employee"
  title?: string
  subtitle?: string
}

// Local Divider if needed

export function SharedTaskInterface({
  user,
  viewMode = "employee",
  title = "Work Management",
  subtitle = "Track your individual contributions and milestone progress."
}: SharedTaskInterfaceProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewModeState, setViewModeState] = useState<"list" | "view" | "edit" | "add">("list")
  const [layoutMode, setLayoutMode] = useState<"grid" | "list" | "calendar">("grid")
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")

  const fetchTasks = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      let response
      if (viewMode === "employee" && user.employee_id) {
        response = await employeesApi.getTasks(user.employee_id.toString(), { page_size: 1000 })
      } else {
        response = await tasksApi.getAll({ page_size: 1000 })
      }

      const backendTasks = response.results || []
      const mapped = backendTasks.map(mapBackendTaskToFrontend)
      setTasks(mapped)
      
      // If we're viewing a task and it was updated, try to refresh its local state if safe
      if (selectedTask) {
        const updatedSelf = mapped.find(t => t.id === selectedTask.id)
        if (updatedSelf && viewModeState === "view") {
           // Only update if metadata changed, don't want to mess with active edits
           setSelectedTask((prev: any) => ({
             ...updatedSelf,
             subtasks: prev.subtasks // Keep current subtask UI state if any
           }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [viewMode, user.employee_id])

  // Real-time synchronization
  useEffect(() => {
    const handleRefresh = (e: any) => {
      // If we are in 'edit' or 'add' mode, we should ONLY sync in the background
      // to avoid unmounting the form while the user is typing
      const isUserBusy = viewModeState === "edit" || viewModeState === "add"
      fetchTasks(isUserBusy || viewModeState === "view")
    }

    window.addEventListener('refreshTasks', handleRefresh)
    return () => {
      window.removeEventListener('refreshTasks', handleRefresh)
    }
  }, [viewMode, user.employee_id, viewModeState, selectedTask]) // include deps in case fetchTasks needs them

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-border/40">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Synchronizing with server...</p>
      </div>
    )
  }

  // Stats
  const pendingCount = tasks.filter((task) => task.status === "pending").length
  const inProgressCount = tasks.filter((task) => task.status === "in-progress").length
  const completedCount = tasks.filter((task) => task.status === "completed").length
  const overdueCount = tasks.filter((task) => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && task.status !== "completed"
  }).length

  // Filter tasks based on search and filters
  const filteredTasks = tasks.filter((task) => {
    const title = task.title || ""
    const description = task.description || ""
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleViewTask = (task: any) => {
    const taskWithSubtasks = {
      ...task,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
    };
    setSelectedTask(taskWithSubtasks)
    setViewModeState("view")
  }

  const handleBackToList = () => {
    setSelectedTask(null)
    setViewModeState("list")
  }

  const handleTaskComplete = async (taskId: string) => {
    if (user.role !== 'admin') {
      alert("Only administrators can mark the entire task as complete.")
      return
    }
    try {
      await tasksApi.completeTask(taskId)
      // Refresh local tasks
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t))
      // Back to list if we were in view mode
      if (viewModeState === "view") {
        setViewModeState("list")
        setSelectedTask(null)
      }
    } catch (error) {
      console.error("Failed to complete task:", error)
      alert("Failed to complete task on server.")
    }
  }

  const handleAddTask = () => {
    if (user.role !== 'admin') return
    setSelectedTask(null)
    setViewModeState("add")
  }

  const handleSaveTask = async (taskData: any) => {
    if (user.role !== 'admin') return
    try {
      const updateData: any = {}
      if (taskData.title) updateData.title = taskData.title
      if (taskData.description) updateData.description = taskData.description
      if (taskData.status) updateData.status = taskData.status
      if (taskData.priority) {
        updateData.priority = typeof taskData.priority === 'string' ?
          (taskData.priority === 'high' ? 3 : taskData.priority === 'medium' ? 2 : 1) :
          taskData.priority
      }
      if (taskData.dueDate) updateData.due_date = taskData.dueDate
      if (taskData.progress !== undefined) updateData.progress = taskData.progress
      
      if (taskData.base_price) updateData.base_price = taskData.base_price
      else if (taskData.price !== undefined) updateData.base_price = taskData.price.toString()

      if (taskData.assigned_to_id !== undefined) {
        updateData.assigned_to_id = taskData.assigned_to_id
      } else if (taskData.assignedTo !== undefined) {
        updateData.assigned_to_id = taskData.assignedTo === "unassigned" || taskData.assignedTo === "" ? null : parseInt(taskData.assignedTo)
      }

      if (taskData.customer_id) updateData.customer_id = taskData.customer_id
      else if (taskData.customerId) updateData.customer_id = parseInt(taskData.customerId)

      const payload = { ...updateData, subtasks_data: [] }
      const uiSubtasks = (taskData as any).subtasks as Array<any> | undefined
      if (uiSubtasks && Array.isArray(uiSubtasks)) {
        payload.subtasks_data = uiSubtasks.map((st) => {
          const isExisting = st.id && !String(st.id).startsWith('temp-')
          return {
            ...(isExisting ? { id: Number(st.id) } : {}),
            title: st.title,
            description: st.description || "",
            status: st.completed ? 'completed' : 'pending',
            requires_proof: st.requiresProof || false,
          }
        })
      }

      if (viewModeState === "add") {
        await tasksApi.create(payload)
      } else {
        await tasksApi.update(selectedTask.id, payload)
      }
      
      await fetchTasks() // Refresh list
      setViewModeState("list")
      setSelectedTask(null)
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Failed to save task. Please try again.")
    }
  }

  if (viewModeState === "edit" && selectedTask) {
    return <TaskForm task={selectedTask} onSave={handleSaveTask} onCancel={handleBackToList} />
  }

  if (viewModeState === "add") {
    return <TaskForm onSave={handleSaveTask} onCancel={handleBackToList} />
  }

  if (viewModeState === "view" && selectedTask) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <TaskDetails
          task={selectedTask}
          onBack={handleBackToList}
          onEdit={(task) => {
            if (user.role === 'admin') {
              setSelectedTask(task)
              setViewModeState("edit")
            }
          }}
          allowSubtaskCreation={user.role === "admin"}
          onTaskComplete={handleTaskComplete}
          showTaskActions={user.role === "admin"}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">{title}</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 bg-slate-100/50 p-1.5 rounded-xl border border-slate-200">
          {user.role === "admin" && (
            <Button 
              onClick={handleAddTask}
              className="bg-slate-900 hover:bg-slate-800 text-white h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create Objective
            </Button>
          )}
          <Tabs value={layoutMode} onValueChange={(v: any) => setLayoutMode(v)} className="w-[280px]">
            <TabsList className="grid w-full grid-cols-3 bg-transparent p-0">
              <TabsTrigger value="grid" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-8 text-[11px] font-bold uppercase">
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Grid
              </TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-8 text-[11px] font-bold uppercase">
                <List className="h-3.5 w-3.5 mr-1.5" /> List
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg h-8 text-[11px] font-bold uppercase">
                <Calendar className="h-3.5 w-3.5 mr-1.5" /> Cal
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Pending Workflow", count: pendingCount, variant: "orange", icon: Clock },
          { label: "Active Operations", count: inProgressCount, variant: "blue", icon: TrendingUp },
          { label: "Completed Deliverables", count: completedCount, variant: "emerald", icon: CheckCircle2 },
          { label: "Critical Overdue", count: overdueCount, variant: "rose", icon: AlertTriangle },
        ].map((stat) => (
          <Card key={stat.label} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 tabular-nums">{stat.count}</p>
              </div>
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform",
                stat.variant === "orange" ? "bg-orange-50 text-orange-600" :
                stat.variant === "blue" ? "bg-blue-50 text-blue-600" :
                stat.variant === "emerald" ? "bg-emerald-50 text-emerald-600" :
                "bg-rose-50 text-rose-600"
              )}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refined Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search tasks by title or operational description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[160px] h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg text-xs font-black uppercase text-slate-700">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <SelectValue placeholder="Manifest Status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-bold uppercase">All Status</SelectItem>
              <SelectItem value="pending" className="text-xs font-bold uppercase">Pending</SelectItem>
              <SelectItem value="in-progress" className="text-xs font-bold uppercase">In-Progress</SelectItem>
              <SelectItem value="completed" className="text-xs font-bold uppercase">Completed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full md:w-[160px] h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg text-xs font-black uppercase text-slate-700">
              <div className="flex items-center gap-2">
                <Target className="h-3.5 w-3.5 text-slate-400" />
                <SelectValue placeholder="Criticality" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-bold uppercase">All Priorities</SelectItem>
              <SelectItem value="high" className="text-xs font-bold uppercase text-rose-600">High Stakes</SelectItem>
              <SelectItem value="medium" className="text-xs font-bold uppercase text-amber-600">Medium Priority</SelectItem>
              <SelectItem value="low" className="text-xs font-bold uppercase text-slate-600">Low Importance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tasks Grid/List/Calendar */}
      {filteredTasks.length > 0 ? (
        layoutMode === "calendar" ? (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
             <TaskCalendar tasks={filteredTasks} onViewTask={handleViewTask} />
          </div>
        ) : (
          <div className={cn(
            layoutMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              : "space-y-3"
          )}>
            {filteredTasks.map((task) => {
              const daysRemaining = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isOverdue = daysRemaining < 0 && task.status !== "completed"

              return (
                <Card
                  key={task.id}
                  className={cn(
                    "group flex flex-col border border-slate-100 bg-white transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 rounded-2xl overflow-hidden",
                    layoutMode === "list" && "flex-row items-center p-3 gap-6"
                  )}
                  onClick={() => handleViewTask(task)}
                >
                  <div className={cn(
                    "w-full flex-1 flex flex-col",
                    layoutMode === "list" && "flex-row items-center gap-4"
                  )}>
                    {layoutMode === "grid" && (
                      <div className={cn(
                        "h-1 w-full",
                        task.status === "completed" ? "bg-emerald-500" :
                        task.status === "in-progress" ? "bg-blue-500" :
                        "bg-orange-500"
                      )} />
                    )}

                    <div className={cn(
                      "p-5 space-y-4",
                      layoutMode === "list" && "p-0 w-full flex flex-row items-center justify-between"
                    )}>
                      <div className={cn("space-y-1.5 flex-1", layoutMode === "list" && "flex flex-row items-center gap-6 space-y-0")}>
                        <div className="flex items-center gap-2">
                          <Badge className={cn(
                            "rounded-md px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider border-none shadow-none",
                            task.priority === "high" ? "bg-rose-50 text-rose-600" :
                            task.priority === "medium" ? "bg-amber-50 text-amber-600" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {task.priority}
                          </Badge>
                          {isOverdue && <Badge variant="destructive" className="rounded-md px-1.5 py-0 text-[10px] font-bold">OVERDUE</Badge>}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                          {task.title}
                        </h4>
                        {layoutMode === "grid" && (
                          <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed h-8">
                            {task.description || "No description provided."}
                          </p>
                        )}
                      </div>

                      <div className={cn(
                        "space-y-3",
                        layoutMode === "list" && "flex flex-row items-center gap-10 space-y-0 min-w-[300px]"
                      )}>
                        <div className="flex flex-col gap-1 flex-1">
                          <div className="flex justify-between text-[10px] items-center">
                            <span className="font-bold text-slate-400 uppercase tracking-tighter">Progress</span>
                            <span className="font-bold text-slate-600">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-1.5 bg-slate-100" />
                        </div>

                        <div className="flex items-center gap-3 min-w-[120px]">
                          <div className={cn(
                            "h-8 w-8 rounded-lg flex items-center justify-center border",
                            isOverdue ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-slate-50 border-slate-100 text-slate-400"
                          )}>
                            <Clock className="h-4 w-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Deadline</span>
                            <span className={cn("text-xs font-bold whitespace-nowrap", isOverdue && "text-rose-600")}>
                              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>

                        {layoutMode === "grid" && (
                           <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">View Details</span>
                              <ArrowRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                           </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="h-20 w-20 rounded-3xl bg-white flex items-center justify-center mb-6 shadow-sm">
            <Target className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Workspace is quiet</h3>
          <p className="text-muted-foreground text-center max-w-sm mt-2 text-sm">
            We couldn&apos;t find any tasks matching your filters. Try adjusting your search criteria.
          </p>
          <Button 
            variant="outline" 
            onClick={() => { setSearchTerm(""); setStatusFilter("all"); setPriorityFilter("all"); }} 
            className="mt-8 rounded-xl h-10 px-8 bg-white font-bold"
          >
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  )
}