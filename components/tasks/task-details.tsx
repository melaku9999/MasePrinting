"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  Edit,
  Calendar,
  User,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  Loader2,
  RotateCcw,
  FileUp as UploadIcon,
  Check,
  UserPlus,
  Download,
  X
} from "lucide-react"
import type { Task, SubTask } from "@/lib/auth"
import { tasksApi, BACKEND_URL } from "@/lib/api"
import { mapBackendSubtaskToFrontend } from "@/lib/task-utils"
import { FileUpload } from "@/components/files/file-upload"
import { cn } from "@/lib/utils"

interface TaskDetailsProps {
  task: Task
  onEdit: (task: Task) => void
  onBack: () => void
  allowSubtaskCreation?: boolean
  onTaskComplete?: (taskId: string) => void
  showTaskActions?: boolean
  showPrice?: boolean
}

export function TaskDetails({
  task,
  onEdit,
  onBack,
  allowSubtaskCreation = false,
  onTaskComplete,
  showTaskActions = true,
  showPrice = true
}: TaskDetailsProps) {
  const [detailedTask, setDetailedTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || [])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [taskStatus, setTaskStatus] = useState<Task["status"]>(task.status)
  const [isMobile, setIsMobile] = useState(false)

  const fetchDetailedTask = async () => {
    try {
      setLoading(true)
      const response = await tasksApi.getById(task.id)

      const transformedTask: Task = {
        id: response.id.toString(),
        title: response.title,
        description: response.description || "",
        customerId: response.customer?.id?.toString() || "",
        serviceId: response.service?.id?.toString() || "",
        status: response.status,
        priority: response.priority,
        dueDate: response.due_date || "",
        createdAt: response.created_at || new Date().toISOString(),
        updatedAt: response.updated_at,
        completedAt: response.completed_at,
        progress: response.progress || 0,
        base_price: response.base_price,
        customer: response.customer,
        service: response.service,
        assignedTo: response.assigned_to?.id?.toString() || "",
        assigned_to: response.assigned_to,
        subtasks: response.subtasks?.map(mapBackendSubtaskToFrontend) || []
      }

      setDetailedTask(transformedTask)
      setSubtasks(transformedTask.subtasks)
      setTaskStatus(transformedTask.status)
    } catch (error) {
      console.error("Error fetching detailed task:", error)
      setDetailedTask(task)
      setSubtasks(task.subtasks || [])
      setTaskStatus(task.status)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetailedTask()
  }, [task.id])

  // Real-time synchronization
  useEffect(() => {
    const handleRefresh = () => {
      // Small optimization: only fetch if not currently user-interacting or just fetch anyway
      fetchDetailedTask()
    }

    window.addEventListener('refreshTasks', handleRefresh)
    return () => {
      window.removeEventListener('refreshTasks', handleRefresh)
    }
  }, [task.id])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleSubtaskToggle = async (subtaskId: string) => {
    const st = subtasks.find(s => s.id === subtaskId)
    if (!st) return

    if (!st.completed) {
      if (st.requiresProof && (!st.proofFiles || st.proofFiles.length === 0)) {
        alert('Proof files required for this subtask.')
        return
      }
      await handleCompleteSubtask(subtaskId)
    } else {
      await handleUnmarkSubtask(subtaskId)
    }
  }

  const handleCompleteSubtask = async (subtaskId: string, files?: File[]) => {
    try {
      setUpdating(true)
      if (files && files.length > 0) {
        const formData = new FormData()
        files.forEach(file => formData.append('files', file))
        await tasksApi.uploadProofs(subtaskId, formData)
        // Also ensure it is marked done
        await tasksApi.markSubtaskDone(subtaskId)
      } else {
        await tasksApi.markSubtaskDone(subtaskId)
      }
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
    } catch (e) {
      console.error("Failed to complete subtask:", e)
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteProof = async (proofId: number) => {
    if (!confirm('Are you sure you want to delete this proof file?')) return
    try {
      setUpdating(true)
      await tasksApi.deleteProof(proofId)
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
    } catch (e) {
      console.error("Failed to delete proof:", e)
    } finally {
      setUpdating(false)
    }
  }

  const handleSubtaskMetadataChange = (subtaskId: string, field: 'amount' | 'comment', value: any) => {
    setSubtasks((prev) => prev.map((st) => {
      if (st.id === subtaskId) {
        return { 
          ...st, 
          additionalCost: {
            amount: field === 'amount' ? parseFloat(value) || 0 : (st.additionalCost?.amount || 0),
            comment: field === 'comment' ? value : (st.additionalCost?.comment || "")
          }
        };
      }
      return st;
    }))
  }

  const handleUnmarkSubtask = async (subtaskId: string) => {
    try {
      setUpdating(true)
      await tasksApi.markSubtaskUndone(subtaskId)
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
    } catch (e) {
      console.error("Failed to unmark subtask:", e)
    } finally {
      setUpdating(false)
    }
  }

  const refreshLocalState = (data: any) => {
    const transformed: Task = {
      id: data.id.toString(),
      title: data.title,
      description: data.description || "",
      customerId: data.customer?.id?.toString() || "",
      serviceId: data.service?.id?.toString() || "",
      status: data.status,
      priority: data.priority,
      dueDate: data.due_date || "",
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at,
      completedAt: data.completed_at,
      progress: data.progress || 0,
      base_price: data.base_price,
      customer: data.customer,
      service: data.service,
      assignedTo: data.assigned_to || "",
      subtasks: data.subtasks?.map(mapBackendSubtaskToFrontend) || []
    }
    setDetailedTask(transformed)
    setSubtasks(transformed.subtasks || [])
    setTaskStatus(transformed.status || "pending")
  }

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSt: SubTask = {
        id: `temp-${Date.now()}`,
        title: newSubtaskTitle.trim(),
        completed: false,
        assignedTo: detailedTask?.assignedTo || "",
      }
      setSubtasks((prev) => [...prev, { ...newSt, isNew: true } as any])
      setNewSubtaskTitle("")
    }
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId))
  }

  const handleSaveSubtasks = async () => {
    try {
      setUpdating(true)
      const subtasksPayload = subtasks.map((st: any) => ({
        ...(st.id && !String(st.id).startsWith('temp-') ? { id: Number(st.id) } : {}),
        title: st.title,
        status: st.completed ? "completed" : "pending",
        description: st.description || "",
        additional_cost: st.additionalCost?.amount || 0,
        additional_cost_notes: st.additionalCost?.comment || "",
        requires_proof: st.requiresProof || false
      }))
      await tasksApi.update(task.id, { subtasks_data: subtasksPayload })
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
    } catch (e) {
      console.error("Failed to save subtasks:", e)
      alert("Error saving changes.")
    } finally {
      setUpdating(false)
    }
  }

  const handleCompleteTask = async () => {
    const incomplete = subtasks.filter(st => !st.completed)
    if (incomplete.length > 0) {
      alert('Complete all subtasks first.')
      return
    }

    try {
      setUpdating(true)
      await tasksApi.completeTask(task.id)
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
      if (onTaskComplete) onTaskComplete(task.id)
    } catch (error) {
      console.error("Failed to complete task:", error)
    } finally {
      setUpdating(false)
    }
  }

  const handleReopenTask = async () => {
    try {
      setUpdating(true)
      await tasksApi.update(task.id, { status: "in-progress" })
      const refreshed = await tasksApi.getById(task.id)
      refreshLocalState(refreshed)
    } catch (e) {
      console.error("Failed to reopen task:", e)
    } finally {
      setUpdating(false)
    }
  }

  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase().replace('_', '-')
    switch (s) {
      case "completed": return "bg-emerald-50 text-emerald-700 border-emerald-100"
      case "in-progress": return "bg-blue-50 text-blue-700 border-blue-100"
      case "pending": return "bg-amber-50 text-amber-700 border-amber-100"
      case "cancelled": return "bg-slate-100 text-slate-500 border-slate-200"
      default: return "bg-slate-50 text-slate-400 border-slate-100"
    }
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    const val = typeof priority === 'number' ? priority : (priority === 'high' ? 3 : priority === 'medium' ? 2 : 1)
    switch (val) {
      case 3: return "bg-rose-50 text-rose-700 border-rose-100"
      case 2: return "bg-orange-50 text-orange-700 border-orange-100"
      case 1: return "bg-slate-50 text-slate-600 border-slate-200"
      default: return "bg-slate-50 text-slate-400 border-slate-100"
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    if (!dueDate) return 0
    const diff = new Date(dueDate).getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
        <p className="text-slate-500 font-medium">Loading task workspace...</p>
      </div>
    )
  }

  const currentTask = detailedTask || task
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const calculatedProgress = currentTask.progress ?? (totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0)
  const daysUntilDue = getDaysUntilDue(currentTask.dueDate)
  const isOverdue = daysUntilDue < 0

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Notion-style Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-8">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          className="h-10 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-all rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-2" />
          Return to Hub
        </Button>
        <div className="flex items-center gap-3">
          {showTaskActions && (
            <>
              {taskStatus === "completed" ? (
                <Button variant="outline" onClick={handleReopenTask} className="h-11 border-slate-200 hover:bg-slate-50 text-slate-600 px-5 rounded-xl shadow-sm font-bold text-xs">
                  <RotateCcw className="h-3.5 w-3.5 mr-2" />
                  Restore Session
                </Button>
              ) : (
                <Button variant="outline" onClick={() => onEdit(currentTask)} className="h-11 border-slate-200 hover:bg-slate-50 text-slate-600 px-5 rounded-xl shadow-sm font-bold text-xs">
                  <Edit className="h-3.5 w-3.5 mr-2" />
                  Modify Details
                </Button>
              )}
              <Button
                onClick={handleCompleteTask}
                disabled={taskStatus === "completed" || updating}
                className="h-11 bg-slate-900 hover:bg-slate-800 text-white px-6 rounded-xl shadow-lg disabled:opacity-50 transition-all active:scale-95 font-bold text-xs"
              >
                {updating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <CheckCircle2 className="h-3.5 w-3.5 mr-2" />}
                {taskStatus === "completed" ? "Successfully Finalized" : "Confirm Completion"}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Workspace */}
        <div className="lg:col-span-2 space-y-12">
          {/* Document Header */}
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shadow-sm", getPriorityColor(currentTask.priority))}>
                {typeof currentTask.priority === 'number' ? (currentTask.priority === 3 ? 'High' : (currentTask.priority === 2 ? 'Medium' : 'Low')) : currentTask.priority} Priority
              </span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest shadow-sm", getStatusColor(taskStatus))}>
                {taskStatus?.replace(/[-_]/g, ' ') || "Pending"}
              </span>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-slate-900 leading-[0.9]">
                {currentTask.title}
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-3xl whitespace-pre-wrap">
                {currentTask.description || "The scope of this tactical objective is currently being defined."}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-slate-50 mt-8">
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Customer</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-sm truncate">{currentTask.customer?.name || "Private Entity"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Service Flow</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <Building2 className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-sm truncate">{currentTask.service?.name || currentTask.service_name || "General Ops"}</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Deadline</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  <span className={cn("font-semibold text-sm", isOverdue ? "text-rose-600" : "text-slate-700")}>
                    {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "Flexible"}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Assigned To</p>
                <div className="flex items-center gap-2 text-slate-700">
                  <UserPlus className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-semibold text-sm truncate">{currentTask.assigned_to?.name || "Unassigned"}</span>
                </div>
              </div>
              {showPrice && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400 tracking-tighter">Total Base Price</p>
                  <div className="flex items-center gap-2 text-emerald-600 font-bold">
                    <span className="text-sm tracking-tight">${currentTask.price || currentTask.base_price || "0.00"}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Workflow Checklist */}
          <div className="space-y-6 pt-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">Workflow Checklist</h3>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-200">
                  {completedSubtasks} / {totalSubtasks}
                </span>
              </div>
              {allowSubtaskCreation && (
                <Button variant="ghost" size="sm" onClick={handleSaveSubtasks} className="text-slate-400 hover:text-slate-900 text-xs font-bold hover:bg-slate-50 rounded-lg">
                  <Check className="h-3.5 w-3.5 mr-1" /> Save Workflow
                </Button>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm divide-y divide-slate-100 overflow-hidden">
              {subtasks.length === 0 ? (
                <div className="p-16 text-center bg-slate-50/20">
                  <CheckCircle2 className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400 text-sm font-medium">No checklist items defined.</p>
                </div>
              ) : (
                subtasks.map((st, idx) => (
                  <div key={st.id} className={cn("group p-5 hover:bg-slate-50/50 transition-all", st.completed && "bg-slate-50/30")}>
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={st.completed}
                        onCheckedChange={() => handleSubtaskToggle(st.id)}
                        disabled={updating}
                        className="mt-1 h-5 w-5 rounded-md border-slate-300 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500 transition-all"
                      />
                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h4 className={cn("font-bold text-slate-800 text-base transition-all", st.completed && "text-slate-400 line-through")}>
                              {st.title}
                            </h4>
                            {st.description && (
                              <p className={cn("text-xs text-slate-500 mt-1 leading-relaxed", st.completed && "opacity-50")}>{st.description}</p>
                            )}
                            <div className="space-y-3 mt-3">
                              <div className="flex flex-wrap items-center gap-3">
                                {st.requiresProof && (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 uppercase tracking-tighter shadow-sm">
                                    <UploadIcon className="h-3 w-3" /> Proof Required
                                  </span>
                                )}

                                {st.proofFiles && st.proofFiles.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {st.proofFiles.map((pf) => (
                                      <div key={pf.id} className="flex items-center gap-2 bg-blue-50/50 p-1 px-2 rounded-lg border border-blue-100 group/proof hover:border-blue-300 transition-all">
                                        <Button
                                          size="sm"
                                          variant="link"
                                          onClick={() => window.open(`${BACKEND_URL}/api/tasks/proofs/${pf.id}/download/`, '_blank')}
                                          className="h-auto p-0 text-[10px] font-bold text-blue-700 hover:no-underline flex items-center gap-1"
                                        >
                                          <Download className="h-3 w-3" /> {pf.original_name || "View Proof"}
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => handleDeleteProof(pf.id)}
                                          className="h-4 w-4 p-0 text-slate-400 hover:text-rose-500 rounded-full"
                                        >
                                          <X className="h-2.5 w-2.5" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                {showPrice && (
                                  <>
                                    <div className={cn(
                                      "flex items-center gap-2 bg-slate-50/50 p-1 px-2 rounded-lg border border-slate-100 group/input focus-within:border-slate-300 transition-all",
                                      !allowSubtaskCreation && "opacity-60 cursor-not-allowed"
                                    )}>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cost $</span>
                                      <input 
                                        type="number" 
                                        value={st.additionalCost?.amount || 0}
                                        onChange={(e) => handleSubtaskMetadataChange(st.id, 'amount', e.target.value)}
                                        className="w-16 bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 p-0 h-6 disabled:cursor-not-allowed"
                                        placeholder="0.00"
                                        disabled={!allowSubtaskCreation}
                                      />
                                    </div>
                                    
                                    <div className={cn(
                                      "flex-1 min-w-[200px] bg-slate-50/50 p-1 px-2 rounded-lg border border-slate-100 group/input focus-within:border-slate-300 transition-all",
                                      !allowSubtaskCreation && "opacity-60 cursor-not-allowed"
                                    )}>
                                      <input 
                                        type="text" 
                                        value={st.additionalCost?.comment || ""}
                                        onChange={(e) => handleSubtaskMetadataChange(st.id, 'comment', e.target.value)}
                                        className="w-full bg-transparent border-none text-xs text-slate-600 focus:ring-0 p-0 h-6 italic disabled:cursor-not-allowed"
                                        placeholder="Reason for expense (e.g. Courier fee)"
                                        disabled={!allowSubtaskCreation}
                                      />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!st.completed ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCompleteSubtask(st.id)}
                                disabled={st.requiresProof && (!st.proofFiles || st.proofFiles.length === 0)}
                                className="h-8 text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              >
                                Mark Done
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleUnmarkSubtask(st.id)}
                                className="h-8 text-[11px] font-bold text-amber-600 hover:bg-amber-50 rounded-lg"
                              >
                                Undo
                              </Button>
                            )}
                            {allowSubtaskCreation && (
                              <Button variant="ghost" size="icon" onClick={() => handleDeleteSubtask(st.id)} className="h-8 w-8 text-slate-300 hover:text-rose-500 rounded-lg">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {st.requiresProof && !st.completed && (
                          <div className="bg-slate-50/80 rounded-xl p-6 border border-slate-200 border-dashed transition-all hover:bg-white hover:border-slate-300">
                            <FileUpload
                              taskId={currentTask.id}
                              onUploadComplete={(files) => {
                                handleCompleteSubtask(st.id, files);
                              }}
                              maxFiles={5}
                              acceptedTypes={[".jpg", ".jpeg", ".png", ".pdf", ".csv", ".doc", ".docx", ".xls", ".xlsx", ".txt"]}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}

              {allowSubtaskCreation && (
                <div className="p-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        placeholder="Add a step to this workflow..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                        className="pl-9 h-11 border-dashed border-2 border-slate-200 bg-white hover:border-slate-300 focus:border-slate-400 transition-all rounded-xl"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Workspace Context Sidebar */}
        <div className="space-y-8">
          {/* Progress Overview Section */}
          <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Global Health</h4>
                  <p className="text-3xl font-black tabular-nums tracking-tighter">{calculatedProgress}<span className="text-lg font-bold text-slate-500 ml-0.5">%</span></p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center text-emerald-400 shadow-inner group-hover:scale-110 transition-transform">
                  <Clock className="h-6 w-6" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Velocity</span>
                  <span className="text-xs font-black text-emerald-400">{completedSubtasks} / {totalSubtasks} Items</span>
                </div>
                <Progress value={calculatedProgress} className="h-2.5 bg-slate-800" />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Status</p>
                  <p className="text-sm font-bold capitalize text-slate-200">{taskStatus?.replace(/[-_]/g, ' ') || "Pending"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Days Left</p>
                  <p className={cn("text-sm font-bold", isOverdue ? "text-rose-400" : "text-slate-200")}>
                    {isOverdue ? "Overdue" : `${daysUntilDue}d`}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/5 blur-[80px] rounded-full group-hover:bg-emerald-500/10 transition-colors" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/5 blur-[80px] rounded-full group-hover:bg-blue-500/10 transition-colors" />
          </div>

          {/* Activity Log / Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-7 space-y-8">
            <h4 className="font-black text-slate-900 text-xs uppercase tracking-[0.1em] flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
              Activity Context
            </h4>

            <div className="space-y-8 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
              <div className="relative pl-10">
                <div className="absolute left-[3px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-900 shadow-sm" />
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Creation</p>
                <p className="text-sm font-bold text-slate-800">{currentTask.createdAt ? new Date(currentTask.createdAt).toLocaleDateString() : "Historical record"}</p>
                <p className="text-xs text-slate-400 mt-1">Initial requirements finalized</p>
              </div>

              <div className="relative pl-10">
                <div className={cn("absolute left-[3px] top-1 w-4 h-4 rounded-full border-4 shadow-sm", taskStatus === "completed" ? "border-emerald-500 bg-white" : "border-blue-500 bg-white")} />
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">State Transition</p>
                <p className="text-sm font-bold text-slate-800 capitalize">Moved to {taskStatus?.replace(/[-_]/g, ' ') || "Pending"}</p>
                <p className="text-xs text-slate-400 mt-1">System automated priority triage</p>
              </div>

              {taskStatus === "completed" && (
                <div className="relative pl-10">
                  <div className="absolute left-[3px] top-1 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-200 border-2 border-white" />
                  <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Success</p>
                  <p className="text-sm font-bold text-slate-800">Workflow Finalized</p>
                  <p className="text-xs text-slate-400 mt-1">Proof of work verified by system</p>
                </div>
              )}

              <div className="relative pl-10">
                <div className={cn("absolute left-[3px] top-1 w-4 h-4 rounded-full border-4 shadow-sm", isOverdue ? "border-rose-500 bg-white" : "border-slate-100 bg-white")} />
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Expectation</p>
                <p className={cn("text-sm font-bold", isOverdue ? "text-rose-600" : "text-slate-800")}>
                  {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : "Flexible horizon"}
                </p>
                <p className="text-xs text-slate-400 mt-1">{isOverdue ? "Exceeded quality SLA" : "Remaining buffer within limits"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}