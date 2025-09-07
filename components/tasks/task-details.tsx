"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit, Calendar, User, Building, Plus, Trash2, CheckCircle2, Clock, AlertCircle, Upload } from "lucide-react"
import type { Task, SubTask } from "@/lib/auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { FileUpload } from "@/components/files/file-upload"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface TaskDetailsProps {
  task: Task
  onEdit: () => void
  onBack: () => void
  allowSubtaskCreation?: boolean
}

export function TaskDetails({ task, onEdit, onBack, allowSubtaskCreation = false }: TaskDetailsProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("")

  const handleSubtaskToggle = (subtaskId: string) => {
    setSubtasks((prev) => prev.map((st) => (st.id === subtaskId ? { ...st, completed: !st.completed } : st)))
  }

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      const newSubtask: SubTask = {
        id: Date.now().toString(),
        title: newSubtaskTitle.trim(),
        completed: false,
        assignedTo: task.assignedTo,
      }
      setSubtasks((prev) => [...prev, newSubtask])
      setNewSubtaskTitle("")
    }
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((st) => st.id !== subtaskId))
  }

  const completedSubtasks = subtasks.filter((st) => st.completed).length
  const totalSubtasks = subtasks.length
  const calculatedProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

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
        return "text-red-600 border-red-600"
      case "medium":
        return "text-orange-600 border-orange-600"
      case "low":
        return "text-green-600 border-green-600"
      default:
        return "text-muted-foreground border-muted-foreground"
    }
  }

  const getDaysUntilDue = (dueDate: string): number => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const daysUntilDue = getDaysUntilDue(task.dueDate)
  const isOverdue = daysUntilDue < 0
  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="flex items-center gap-2 bg-transparent">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <h2 className="text-2xl font-bold text-card-foreground">Task Details</h2>
        </div>
        <Button onClick={onEdit} className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Edit Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Task Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">{task.title}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                  <Badge variant="outline" className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{task.description}</p>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-sm text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                    {isOverdue && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {Math.abs(daysUntilDue)} days overdue
                      </p>
                    )}
                    {isDueSoon && (
                      <p className="text-sm text-orange-600 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Due in {daysUntilDue} days
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Assigned To</p>
                    <p className="text-sm text-muted-foreground">Employee {task.assignedTo}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm text-muted-foreground">Customer {task.customerId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Created</p>
                    <p className="text-sm text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Subtasks ({completedSubtasks}/{totalSubtasks})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allowSubtaskCreation && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Add new subtask..."
                    value={newSubtaskTitle}
                    onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button onClick={handleAddSubtask} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Subtasks ({subtasks.filter(st => st.completed).length}/{subtasks.length})</h2>
                  {allowSubtaskCreation && (
                    <Button className="rounded-2xl" onClick={handleAddSubtask}>+ Add Subtask</Button>
                  )}
                </div>
                {subtasks.map((subtask, idx) => (
                  <Card key={subtask.id} className="shadow-sm rounded-2xl">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Checkbox checked={subtask.completed} onCheckedChange={() => handleSubtaskToggle(subtask.id)} className="h-5 w-5" />
                          <span className="text-lg font-medium">{subtask.title}</span>
                          {subtask.completed && <span className="ml-2 text-sm text-green-600 font-semibold">Done</span>}
                        </div>
                        {allowSubtaskCreation && (
                          <Button variant="outline" size="icon" className="rounded-full" onClick={() => handleDeleteSubtask(subtask.id)}>🗑</Button>
                        )}
                      </div>

                      {subtask.requiresProof && (
                        <div className="border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                          <Upload className="mx-auto h-8 w-8 text-gray-400" />
                          <p className="mt-2 text-gray-600">Drag & drop files here or click to upload</p>
                          <FileUpload
                            taskId={task.id}
                            onUploadComplete={(files) => {
                              setSubtasks((prev) => prev.map((st, i) => i === idx ? { ...st, proofFiles: files } : st));
                            }}
                            maxFiles={3}
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Assigned to</p>
                          <p className="font-medium">Employee {subtask.assignedTo}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Due Date</p>
                          <p className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{task.createdAt ? new Date(task.createdAt).toLocaleDateString() : "-"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Cost</p>
                          <p className="font-medium">{subtask.additionalCost?.amount ? `$${subtask.additionalCost.amount}` : "-"} {subtask.additionalCost?.comment ? `(${subtask.additionalCost.comment})` : ""}</p>
                        </div>
                      </div>

                      <div className="grid gap-4">
                        <Input
                          type="number"
                          value={subtask.additionalCost?.amount ?? ""}
                          placeholder="Enter Additional Cost ($)"
                          onChange={e => {
                            const value = parseFloat(e.target.value);
                            setSubtasks((prev) => prev.map((st, i) => i === idx ? { ...st, additionalCost: { ...st.additionalCost, amount: value, comment: st.additionalCost?.comment ?? "" } } : st));
                          }}
                        />
                        <Textarea
                          value={subtask.additionalCost?.comment ?? ""}
                          placeholder="Reason for Additional Cost (e.g. Stock images, licenses, etc.)"
                          onChange={e => {
                            const value = e.target.value;
                            setSubtasks((prev) => prev.map((st, i) => i === idx ? { ...st, additionalCost: { ...st.additionalCost, comment: value, amount: st.additionalCost?.amount ?? 0 } } : st));
                          }}
                        />
                      </div>

                      {subtask.proofFiles && subtask.proofFiles.length > 0 && (
                        <div className="bg-gray-100 rounded-xl p-3">
                          <p className="text-sm text-gray-600">Uploaded Files:</p>
                          <ul className="list-disc list-inside text-sm text-gray-800">
                            {subtask.proofFiles.map((file, i) => (
                              <li key={i}>{file.name}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {subtasks.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  {allowSubtaskCreation
                    ? "No subtasks yet. Add one above to get started."
                    : "No subtasks assigned to this task."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Progress & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{calculatedProgress}%</div>
                <Progress value={calculatedProgress} className="h-3" />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Total Subtasks:</span>
                  <span className="font-medium">{totalSubtasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Completed:</span>
                  <span className="font-medium text-secondary">{completedSubtasks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Remaining:</span>
                  <span className="font-medium">{totalSubtasks - completedSubtasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Task Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Task Created</p>
                    <p className="text-xs text-muted-foreground">{new Date(task.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {task.status === "in-progress" && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="w-2 h-2 bg-secondary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">In Progress</p>
                      <p className="text-xs text-muted-foreground">Currently active</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg opacity-50">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-xs text-muted-foreground">{new Date(task.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
