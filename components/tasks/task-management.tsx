"use client"

import { useState, useEffect } from "react"
import { TaskList } from "./task-list"
import { TaskForm } from "./task-form"
import { TaskDetails } from "./task-details"
import type { Task } from "@/lib/auth"
import { tasksApi, employeesApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

type ViewMode = "list" | "add" | "edit" | "view"

interface Employee {
  employee_id: number
  employee_name: string
}

interface TaskManagementProps {
  user: User
  showCustomerInfo?: boolean
  allowSubtaskCreation?: boolean
}

export function TaskManagement({ user, showCustomerInfo = true, allowSubtaskCreation = false }: TaskManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Fetch employees from backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true)
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

        setEmployees(transformedEmployees)
      } catch (error) {
        console.error("Error fetching employees:", error)
        setEmployees([])
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [])

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)

    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setViewMode("view")
  }

  const handleEditTask = (task: Task) => {
    if (user.role !== 'admin') return
    setSelectedTask(task)
    setViewMode("edit")
  }

  const handleAddTask = () => {
    if (user.role !== 'admin') return
    setSelectedTask(null)
    setViewMode("add")
  }

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (selectedTask) {
        // Update existing task
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

        if ((taskData as any).assigned_to_id !== undefined) {
          updateData.assigned_to_id = (taskData as any).assigned_to_id
        } else if (taskData.assignedTo !== undefined) {
          updateData.assigned_to_id = taskData.assignedTo === "unassigned" || taskData.assignedTo === "" ? null : parseInt(taskData.assignedTo)
        }

        const payload = { ...updateData, subtasks_data: [] }
        const uiSubtasks = (taskData as any).subtasks as Array<any> | undefined
        if (uiSubtasks && Array.isArray(uiSubtasks)) {
          payload.subtasks_data = uiSubtasks.map((st) => {
            const isExisting = typeof st.id === 'string' && /^\d+$/.test(st.id)
            return {
              ...(isExisting ? { id: Number(st.id) } : {}),
              title: st.title,
              description: st.description || "",
              status: st.completed ? 'completed' : 'pending',
              additional_cost: st.additionalCost?.amount || 0,
              additional_cost_notes: st.additionalCost?.comment || "",
              requires_proof: st.requiresProof || false
            }
          })
        }
        await tasksApi.update(selectedTask.id, payload)
      } else {
        // Create new task
        const assignedToVal = taskData.assignedTo === "unassigned" || taskData.assignedTo === "" || !taskData.assignedTo 
          ? null 
          : parseInt(taskData.assignedTo)

        const createData = {
          title: taskData.title || "Untitled Task",
          description: taskData.description || "",
          customer_id: (taskData as any).customer_id || parseInt(taskData.customerId || "0"),
          status: taskData.status || "pending",
          priority: typeof taskData.priority === 'string' ?
            (taskData.priority === 'high' ? 3 : taskData.priority === 'medium' ? 2 : 1) :
            taskData.priority || 2,
          due_date: (taskData as any).due_date || taskData.dueDate || new Date().toISOString(),
          progress: taskData.progress || 0,
          base_price: taskData.base_price || (taskData.price !== undefined ? taskData.price.toString() : "0.00"),
          assigned_to_id: (taskData as any).assigned_to_id || assignedToVal,
          subtasks_data: ((taskData as any).subtasks || []).map((st: any) => ({
            title: st.title,
            description: st.description || "",
            status: st.completed ? 'completed' : 'pending',
            additional_cost: st.additionalCost?.amount || 0,
            additional_cost_notes: st.additionalCost?.comment || "",
            requires_proof: st.requiresProof || false
          }))
        }
        await tasksApi.create(createData)
      }
      setViewMode("list")
    } catch (error) {
      console.error("Error saving task:", error)
      alert("Failed to save task. Please try again.")
    }
  }

  const handleCancel = () => {
    setSelectedTask(null)
    setViewMode("list")
  }

  const handleBackToList = () => {
    setSelectedTask(null)
    setViewMode("list")
  }

  const handleAssignTask = async (taskId: string, employeeId: string) => {
    if (user.role !== 'admin') {
      alert("Only administrators can assign tasks.")
      return
    }
    try {
      await tasksApi.assign(taskId, parseInt(employeeId))
      alert("Task assigned successfully!")
      handleBackToList()
      window.dispatchEvent(new CustomEvent('taskAssigned', { detail: { taskId, employeeId } }));
    } catch (error) {
      console.error("Error assigning task:", error)
      alert("Failed to assign task. Please try again.")
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      // Dispatch a custom event to notify TaskList to refresh
      window.dispatchEvent(new CustomEvent('refreshTasks'))
    } catch (error) {
      console.error("Error refreshing tasks:", error)
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Task Management</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Operational Workflow & Tactical Execution Registry</p>
      </div>

      <div className="space-y-8">
        {(() => {
          switch (viewMode) {
            case "add":
              return <TaskForm onSave={handleSaveTask} onCancel={handleCancel} />
            case "edit":
              return <TaskForm task={selectedTask!} onSave={handleSaveTask} onCancel={handleCancel} />
            case "view":
              return (
                <TaskDetails
                  task={selectedTask!}
                  onEdit={(task) => handleEditTask(task)}
                  onBack={handleBackToList}
                  allowSubtaskCreation={user.role === 'admin'}
                  showTaskActions={user.role === 'admin'}
                  onTaskComplete={(taskId) => {
                    if (user.role === 'admin') {
                      console.log('Task completed:', taskId)
                      handleBackToList()
                    }
                  }}
                />
              )
            default:
              return (
                <TaskList
                  onViewTask={handleViewTask}
                  onEditTask={handleEditTask}
                  onAddTask={handleAddTask}
                  onAssignTask={handleAssignTask}
                  showCustomerInfo={showCustomerInfo}
                  employees={employees}
                  loadingEmployees={loadingEmployees}
                  user={user}
                />
              )
          }
        })()}
      </div>
    </div>
  )
}
