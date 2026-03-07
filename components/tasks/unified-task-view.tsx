"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Edit, Calendar, Plus, Trash2, CheckCircle2,
  Clock, Upload, Target, FileText,
  Lock, Zap, Info, ShieldCheck, Download
} from "lucide-react"
import type { Task, SubTask } from "@/lib/auth"
import { FileUpload } from "@/components/files/file-upload"
import { cn } from "@/lib/utils"
import { tasksApi } from "@/lib/api"

interface UnifiedTaskViewProps {
  task: Task
  onEdit?: () => void
  onBack: () => void
  allowSubtaskCreation?: boolean
  onTaskComplete?: (taskId: string) => void
  currentUserId?: string
  isAssignedUser?: boolean
  viewMode?: "admin" | "employee"
  useSequentialWorkflow?: boolean
}

export function UnifiedTaskView({
  task, onEdit, onBack, allowSubtaskCreation = false, onTaskComplete,
  currentUserId, isAssignedUser = true, viewMode = "admin", useSequentialWorkflow = false
}: UnifiedTaskViewProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks || [])
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")
  const [taskStatus, setTaskStatus] = useState<Task["status"]>(task.status)

  // Calculate stats
  const completedSubtasksCount = subtasks.filter(st => st.completed).length
  const totalSubtasksCount = subtasks.length
  const calculatedProgressValue = totalSubtasksCount > 0 ? Math.round((completedSubtasksCount / totalSubtasksCount) * 100) : 0

  // Sequential logic
  const currentSubtaskIdx = useSequentialWorkflow ? subtasks.findIndex(st => !st.completed) : -1

  const handleSubtaskToggleAction = async (subtaskId: string) => {
    const sidx = subtasks.findIndex(st => st.id === subtaskId)
    const st = subtasks[sidx]

    if (useSequentialWorkflow && sidx !== currentSubtaskIdx && !st.completed) {
      return
    }

    if (!st.completed && st.requiresProof && (!st.proofFiles || st.proofFiles.length === 0)) {
      alert('Proof of work required: Please upload files for this step first.')
      return
    }

    const newCompleted = !st.completed

    // Optimistic update
    setSubtasks(subtasks.map(item =>
      item.id === subtaskId ? { ...item, completed: newCompleted } : item
    ))

    try {
      if (newCompleted) {
        await tasksApi.markSubtaskDone(subtaskId)
      } else {
        await tasksApi.markSubtaskUndone(subtaskId)
      }
    } catch (error) {
      console.error("Failed to update subtask status:", error)
      // Revert on error
      setSubtasks(subtasks.map(item =>
        item.id === subtaskId ? { ...item, completed: !newCompleted } : item
      ))
      alert("Failed to update status on server. Please try again.")
    }
  }

  const handleAddSubtaskItem = () => {
    if (!newSubtaskTitle.trim()) return
    const newSt: SubTask = {
      id: Math.random().toString(36).substr(2, 9),
      title: newSubtaskTitle.trim(),
      completed: false,
      assignedTo: task.assignedTo || "",
      proofFiles: []
    }
    setSubtasks([...subtasks, newSt])
    setNewSubtaskTitle("")
  }

  const handleDeleteSubtaskItem = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id))
  }

  const handleFileUploadAction = (subtaskId: string, uploadedFiles: File[]) => {
    // Map File objects to proofFiles structure
    const mappedFiles = uploadedFiles.map(f => ({
      name: f.name,
      url: URL.createObjectURL(f), // Mock URL
      uploadedAt: new Date().toISOString()
    }))

    setSubtasks(subtasks.map(st =>
      st.id === subtaskId ? { ...st, proofFiles: [...(st.proofFiles || []), ...mappedFiles] } : st
    ))
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fb]">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full hover:bg-muted/50">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Task Details</span>
                <Badge variant="outline" className="text-[10px] rounded-full h-5 font-bold border-primary/20 bg-primary/5 text-primary">#{task.id}</Badge>
              </div>
              <h1 className="text-xl font-extrabold line-clamp-1">{task.title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && viewMode === "admin" && (
              <Button variant="outline" size="sm" onClick={onEdit} className="rounded-xl border-primary/20 text-primary font-bold">
                <Edit className="h-4 w-4 mr-2" />
                Edit Task
              </Button>
            )}
            {calculatedProgressValue === 100 && onTaskComplete && taskStatus !== "completed" && (
              <Button
                onClick={() => onTaskComplete(task.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalize Task
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Context & Details */}
          <div className="lg:col-span-8 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-blue-500 to-emerald-500 w-full" />
              <CardContent className="p-8">
                <div className="flex flex-col gap-6">
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2.5">
                      <Target className="h-6 w-6 text-primary" />
                      Task Objectives
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed bg-muted/30 p-6 rounded-2xl border border-dashed border-border/60">
                      {task.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                    <div className="p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center gap-2 text-center">
                      <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-bold uppercase tracking-widest text-[10px]">Priority</Badge>
                      <span className="font-bold text-lg capitalize">{task.priority}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center gap-2 text-center">
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[10px]">Due Date</Badge>
                      <span className="font-bold text-lg">{new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center gap-2 text-center">
                      <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 font-bold uppercase tracking-widest text-[10px]">Status</Badge>
                      <span className="font-bold text-lg capitalize">{taskStatus}</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-white border shadow-sm flex flex-col items-center gap-2 text-center">
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-widest text-[10px]">Role</Badge>
                      <span className="font-bold text-lg capitalize">Member</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2.5">
                  <FileText className="h-6 w-6 text-blue-500" />
                  Documentation & Resources
                </h3>
              </div>
              <div className="grid gap-4">
                {[
                  { name: "Project_Requirements.pdf", size: "1.2 MB" },
                  { name: "Design_Guidelines_v2.docx", size: "840 KB" }
                ].map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-2xl border bg-muted/10 hover:bg-white hover:shadow-md transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-bold text-sm group-hover:text-primary transition-colors">{doc.name}</p>
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-tight">{doc.size}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-lg h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column: Execution & Progress */}
          <div className="lg:col-span-4 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 bg-primary text-primary-foreground p-8 overflow-hidden relative group">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="relative z-10 flex flex-col gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-2">Real-time Progress</p>
                  <h3 className="text-5xl font-extrabold">{calculatedProgressValue}%</h3>
                </div>
                <div className="space-y-4">
                  <Progress value={calculatedProgressValue} className="h-3 bg-white/20" />
                  <p className="text-sm font-medium opacity-80 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    {completedSubtasksCount} of {totalSubtasksCount} milestones achieved
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-xl shadow-black/5 overflow-hidden">
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold flex items-center gap-2.5">
                    <Zap className="h-6 w-6 text-orange-500" />
                    Task Workflow
                  </h3>
                  {useSequentialWorkflow && (
                    <Badge className="bg-orange-50 text-orange-600 border-none font-bold text-[10px] uppercase">Sequential</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0">
                <div className="space-y-4">
                  {subtasks.map((st, index) => {
                    const isTaskLocked = useSequentialWorkflow && index > currentSubtaskIdx && !st.completed
                    const isTaskActive = useSequentialWorkflow && index === currentSubtaskIdx

                    return (
                      <div
                        key={st.id}
                        className={cn(
                          "relative p-4 rounded-2xl border transition-all duration-300 group",
                          st.completed ? "bg-emerald-50/50 border-emerald-100" :
                            isTaskActive ? "bg-white border-primary shadow-lg scale-105 z-10" :
                              isTaskLocked ? "bg-muted/30 border-transparent opacity-60 grayscale" :
                                "bg-white hover:border-primary/50"
                        )}
                      >
                        <div className="flex items-start gap-4">
                          <div className="pt-1">
                            {isTaskLocked ? (
                              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              </div>
                            ) : (
                              <Checkbox
                                checked={st.completed}
                                onCheckedChange={() => handleSubtaskToggleAction(st.id)}
                                className={cn(
                                  "h-6 w-6 rounded-lg",
                                  st.completed ? "border-emerald-500 data-[state=checked]:bg-emerald-500" : ""
                                )}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className={cn(
                                "font-bold text-sm truncate",
                                st.completed ? "text-emerald-700 line-through opacity-60" : "text-foreground"
                              )}>
                                {st.title}
                              </p>
                            </div>

                            {!st.completed && st.requiresProof && (
                              <div className="mt-3 bg-muted/20 rounded-xl p-3 border border-dashed">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-[10px] font-bold uppercase text-muted-foreground">Proof Required</span>
                                  {st.proofFiles && st.proofFiles.length > 0 && (
                                    <Badge variant="secondary" className="text-[9px] h-4">{st.proofFiles.length} uploaded</Badge>
                                  )}
                                </div>
                                <FileUpload
                                  onUploadComplete={(files) => handleFileUploadAction(st.id, files)}
                                />
                              </div>
                            )}

                            {st.completed && st.proofFiles && st.proofFiles.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {st.proofFiles.map((file, i) => (
                                  <div key={i} className="px-2 py-1 rounded bg-white/80 border text-[9px] font-bold flex items-center gap-1">
                                    <FileText className="h-2 w-2" />
                                    {file.name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {viewMode === "admin" && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteSubtaskItem(st.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {allowSubtaskCreation && (
                    <div className="pt-4 flex gap-2">
                      <Input
                        placeholder="Define next milestone..."
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="rounded-xl bg-muted/50 border-none h-10"
                      />
                      <Button size="icon" className="rounded-xl h-10 w-10 shrink-0" onClick={handleAddSubtaskItem}>
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-blue-600 rounded-[2rem] p-8 text-white flex items-center gap-6 overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
              <div className="flex-1 space-y-1">
                <h4 className="font-bold flex items-center gap-2">
                  <Info className="h-4 w-4" /> Hard to complete?
                </h4>
                <p className="text-xs opacity-80 leading-relaxed">Request clarification or delegate sub-milestones to team members.</p>
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/20 rounded-xl h-10 font-bold border border-white/20 shrink-0">
                Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}