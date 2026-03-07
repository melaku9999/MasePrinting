"use client"

import { useState, useEffect } from "react"
import { TaskCalendar } from "@/components/tasks/task-calendar"
import { TaskDetails } from "@/components/tasks/task-details"
import { TaskForm } from "@/components/tasks/task-form"
import { tasksApi } from "@/lib/api"
import { mapBackendTaskToFrontend } from "@/lib/task-utils"
import type { User as AuthUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Calendar as CalendarIcon, Filter, List } from "lucide-react"

interface CalendarManagementProps {
  user: AuthUser
}

export function CalendarManagement({ user }: CalendarManagementProps) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [viewMode, setViewMode] = useState<"calendar" | "view" | "edit">("calendar")

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await tasksApi.getAll({ page_size: 1000 })
      const backendTasks = response.results || []
      const mapped = backendTasks.map(mapBackendTaskToFrontend)
      setTasks(mapped)
    } catch (error) {
      console.error("Failed to fetch tasks for calendar:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  const handleViewTask = (task: any) => {
    const taskWithSubtasks = {
      ...task,
      subtasks: Array.isArray(task.subtasks) ? task.subtasks : []
    };
    setSelectedTask(taskWithSubtasks)
    setViewMode("view")
  }

  const handleBackToCalendar = () => {
    setSelectedTask(null)
    setViewMode("calendar")
  }

  const handleSaveTask = async (taskData: any) => {
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
      
      const payload = { ...updateData, subtasks_data: [] }
      await tasksApi.update(selectedTask.id, payload)
      await fetchTasks()
      handleBackToCalendar()
    } catch (error) {
      console.error("Error saving task from calendar:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[2rem] border border-border/40">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-muted-foreground font-medium">Synchronizing calendar...</p>
      </div>
    )
  }

  if (viewMode === "view" && selectedTask) {
    return (
      <TaskDetails
        task={selectedTask}
        onBack={handleBackToCalendar}
        onEdit={() => setViewMode("edit")}
        allowSubtaskCreation={user.role === "admin"}
        showTaskActions={true}
      />
    )
  }

  if (viewMode === "edit" && selectedTask) {
    return (
      <TaskForm
        task={selectedTask}
        onSave={handleSaveTask}
        onCancel={() => setViewMode("view")}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Operational Calendar</h2>
          <p className="text-muted-foreground">Comprehensive schedule of all system tasks and milestones.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" /> Filter Views
            </Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-black/5 bg-transparent">
        <CardContent className="p-0">
          <TaskCalendar tasks={tasks} onViewTask={handleViewTask} />
        </CardContent>
      </Card>
      
      <div className="pt-4">
          <p className="text-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Interactive schedule • Drag and drop support coming soon
          </p>
      </div>
    </div>
  )
}
