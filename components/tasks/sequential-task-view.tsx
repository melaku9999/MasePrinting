"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Upload,
  Target,
  BarChart3,
  FileText,
  DollarSign,
  Lock,
  Zap,
  Info,
  User,
  RotateCcw
} from "lucide-react"
import type { Task, SubTask } from "@/lib/auth"
import { FileUpload } from "@/components/files/file-upload"

interface SequentialTaskViewProps {
  task: Task
  onBack: () => void
  currentUserId: string
  isAssignedUser: boolean
  onTaskComplete?: (taskId: string) => void
}

export function SequentialTaskView({ task, onBack, currentUserId, isAssignedUser, onTaskComplete }: SequentialTaskViewProps) {
  const [subtasks, setSubtasks] = useState<SubTask[]>(task.subtasks)
  const [taskStatus, setTaskStatus] = useState<Task["status"]>(task.status)
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
  
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const calculatedProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  // Find the current subtask that can be worked on (first incomplete one in sequence)
  const currentSubtaskIndex = subtasks.findIndex(st => !st.completed)
  const currentSubtask = currentSubtaskIndex >= 0 ? subtasks[currentSubtaskIndex] : null

  const canCompleteSubtask = (subtaskIndex: number, subtask: SubTask): boolean => {
    // Only the currently assigned user can complete their subtasks
    if (!isAssignedUser || subtask.assignedTo !== currentUserId) {
      return false
    }
    
    // Must be the current subtask in sequence (first incomplete one)
    if (subtaskIndex !== currentSubtaskIndex) {
      return false
    }
    
    // If proof is required, must have uploaded files
    if (subtask.requiresProof && (!subtask.proofFiles || subtask.proofFiles.length === 0)) {
      return false
    }
    
    return true
  }

  const handleCompleteSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.map(st => 
      st.id === subtaskId ? { ...st, completed: true } : st
    ))
  }

  const handleUnmarkSubtask = (subtaskId: string) => {
    setSubtasks(prev => prev.map(st => 
      st.id === subtaskId ? { ...st, completed: false } : st
    ))
  }

  const handleCompleteTask = () => {
    // Only allow task completion if user is assigned to this task
    if (!isAssignedUser) {
      alert('Only the assigned user can complete this task.')
      return
    }

    // Check if all subtasks are completed
    const incompleteSubtasks = subtasks.filter(st => !st.completed)
    
    if (incompleteSubtasks.length > 0) {
      alert('Cannot complete task: All subtasks must be completed first.')
      return
    }
    
    // Check if all required subtasks have proof files
    const incompleteRequiredTasks = subtasks.filter(st => 
      st.requiresProof && (!st.proofFiles || st.proofFiles.length === 0)
    )
    
    if (incompleteRequiredTasks.length > 0) {
      alert('Cannot complete task: Some subtasks require proof files to be uploaded first.')
      return
    }
    
    // Mark task as completed
    setTaskStatus('completed')
    
    // Call the parent callback to update the database
    if (onTaskComplete) {
      onTaskComplete(task.id)
    }
    
    console.log('Task marked as complete:', task.id)
    // In a real application, this would make an API call to update the database
  }

  const handleReopenTask = () => {
    if (!isAssignedUser) {
      alert('Only the assigned user can reopen this task.')
      return
    }
    
    setTaskStatus('in-progress')
    console.log('Task reopened:', task.id)
    // In a real application, this would make an API call to update the database
  }

  const getSubtaskStatus = (index: number, subtask: SubTask) => {
    if (subtask.completed) {
      return { status: 'completed', color: 'bg-secondary text-secondary-foreground', icon: CheckCircle2 }
    }
    if (index === currentSubtaskIndex) {
      return { status: 'current', color: 'bg-primary text-primary-foreground', icon: Zap }
    }
    if (index < currentSubtaskIndex) {
      return { status: 'completed', color: 'bg-secondary text-secondary-foreground', icon: CheckCircle2 }
    }
    return { status: 'locked', color: 'bg-muted text-muted-foreground', icon: Lock }
  }

  return (
    <div className="space-y-4 lg:space-y-6 px-2 sm:px-0">
      {/* Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl" />
        <div className="relative p-3 sm:p-4 lg:p-6 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <Button variant="outline" size={isMobile ? "sm" : "default"} onClick={onBack} className="bg-card/50 backdrop-blur-sm hover:bg-card w-full sm:w-auto">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  <span className={isMobile ? "text-sm" : ""}>Back to Tasks</span>
                </Button>
                {taskStatus === 'completed' ? (
                  <Badge className="bg-secondary text-secondary-foreground border-secondary/20 text-xs sm:text-sm">
                    Task Completed
                  </Badge>
                ) : (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs sm:text-sm">
                    Sequential Workflow
                  </Badge>
                )}
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {taskStatus !== 'completed' && isAssignedUser && (
                  <Button 
                    onClick={handleCompleteTask}
                    disabled={subtasks.filter(st => !st.completed).length > 0}
                    className="flex items-center justify-center gap-2 shadow-lg bg-secondary hover:bg-secondary/90 text-secondary-foreground disabled:opacity-50 h-10 sm:h-11"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span className={isMobile ? "text-sm" : ""}>Mark Task as Done</span>
                  </Button>
                )}
                {taskStatus === 'completed' && isAssignedUser && (
                  <Button 
                    variant="outline"
                    onClick={handleReopenTask}
                    className="flex items-center justify-center gap-2 shadow-lg text-orange-600 border-orange-200 hover:bg-orange-50 h-10 sm:h-11"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span className={isMobile ? "text-sm" : ""}>Reopen Task</span>
                  </Button>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-primary to-primary/70 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground mb-1 lg:mb-2 break-words">{task.title}</h1>
                <p className="text-muted-foreground text-sm sm:text-base lg:text-lg break-words">{task.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Sequential Workflow Notice */}
          {taskStatus !== 'completed' ? (
            <div className="border-blue-200 bg-blue-50 relative w-full rounded-lg border p-4 flex items-start gap-3">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-blue-800 text-sm">
                <strong>Sequential Workflow:</strong> Tasks must be completed in order. You can only work on the current highlighted task.
                {!isAssignedUser && " Only the assigned user can complete tasks."}
              </div>
            </div>
          ) : (
            <div className="border-secondary/20 bg-secondary/10 relative w-full rounded-lg border p-4 flex items-start gap-3">
              <CheckCircle2 className="h-4 w-4 text-secondary mt-0.5" />
              <div className="text-secondary text-sm">
                <strong>Task Completed:</strong> All subtasks have been finished and the task is marked as done.
              </div>
            </div>
          )}

          {/* Sequential Subtasks */}
          <Card className="border-2 border-muted/50 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-secondary/5 to-transparent">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-secondary" />
                </div>
                Sequential Workflow ({completedSubtasks}/{totalSubtasks})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-4">
                {subtasks.map((subtask, index) => {
                  const statusInfo = getSubtaskStatus(index, subtask)
                  const canComplete = canCompleteSubtask(index, subtask)
                  const isCurrentTask = index === currentSubtaskIndex
                  const isLocked = index > currentSubtaskIndex && !subtask.completed
                  
                  return (
                    <div key={subtask.id} className="relative">
                      {/* Connection line */}
                      {index < subtasks.length - 1 && (
                        <div className={`absolute left-6 top-16 w-0.5 h-12 ${
                          index < currentSubtaskIndex ? 'bg-secondary' : 'bg-muted-foreground/20'
                        }`} />
                      )}
                      
                      <Card className={`border-2 transition-all ${
                        subtask.completed ? 'border-secondary/30 bg-secondary/5' :
                        isCurrentTask ? 'border-primary/50 bg-primary/5 shadow-lg' :
                        isLocked ? 'border-muted/30 bg-muted/10' : 'border-muted/50'
                      }`}>
                        <CardContent className="p-6 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${statusInfo.color}`}>
                                {subtask.completed ? (
                                  <CheckCircle2 className="h-6 w-6" />
                                ) : isLocked ? (
                                  <Lock className="h-6 w-6" />
                                ) : isCurrentTask ? (
                                  <Zap className="h-6 w-6" />
                                ) : (
                                  <span className="font-bold">{index + 1}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className={`text-lg font-semibold ${
                                  subtask.completed ? 'line-through text-muted-foreground' : 
                                  isLocked ? 'text-muted-foreground' : 'text-card-foreground'
                                }`}>
                                  {subtask.title}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                  {subtask.completed && (
                                    <Badge variant="default" className="bg-secondary text-secondary-foreground text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Completed
                                    </Badge>
                                  )}
                                  {isCurrentTask && !subtask.completed && (
                                    <Badge variant="default" className="bg-primary text-primary-foreground text-xs">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Current Task
                                    </Badge>
                                  )}
                                  {isLocked && (
                                    <Badge variant="outline" className="text-xs text-muted-foreground">
                                      <Lock className="h-3 w-3 mr-1" />
                                      Locked
                                    </Badge>
                                  )}
                                  {subtask.requiresProof && (
                                    <Badge variant="outline" className="text-xs">
                                      <FileText className="h-3 w-3 mr-1" />
                                      Proof Required
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Proof Upload Section for Current Task */}
                          {isCurrentTask && subtask.requiresProof && !subtask.completed && isAssignedUser && (
                            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center bg-primary/5">
                              <Upload className="mx-auto h-8 w-8 text-primary mb-2" />
                              <p className="text-primary font-medium mb-2">Proof of Work Required</p>
                              <p className="text-sm text-muted-foreground mb-4">
                                Upload proof files before marking this task as complete
                              </p>
                              <FileUpload
                                taskId={task.id}
                                onUploadComplete={(files) => {
                                  setSubtasks(prev => prev.map((st, i) => 
                                    i === index ? { ...st, proofFiles: files } : st
                                  ))
                                }}
                                maxFiles={3}
                              />
                              {(!subtask.proofFiles || subtask.proofFiles.length === 0) && (
                                <div className="mt-4 border-orange-200 bg-orange-50 relative w-full rounded-lg border p-4 flex items-start gap-3">
                                  <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                                  <div className="text-orange-800 text-sm">
                                    You must upload proof files before you can mark this task as complete.
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Subtask Metadata */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                  Assigned to
                                </p>
                                <p className="text-sm font-medium">
                                  {subtask.assignedTo ? `Employee ${subtask.assignedTo}` : 'Unassigned'}
                                </p>
                              </div>
                            </div>
                            {subtask.additionalCost?.amount && (
                              <div className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                    Additional Cost
                                  </p>
                                  <p className="text-sm font-medium">${subtask.additionalCost.amount}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Uploaded Files Display */}
                          {subtask.proofFiles && subtask.proofFiles.length > 0 && (
                            <div className="bg-secondary/10 rounded-xl p-4 border border-secondary/20">
                              <p className="text-sm font-semibold text-secondary mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                Uploaded Files:
                              </p>
                              <ul className="space-y-1">
                                {subtask.proofFiles.map((file, i) => (
                                  <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                                    <div className="w-2 h-2 bg-secondary rounded-full" />
                                    {file.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Complete Task Button */}
                          {isCurrentTask && !subtask.completed && isAssignedUser && (
                            <div className="pt-4 border-t">
                              <Button 
                                onClick={() => handleCompleteSubtask(subtask.id)}
                                disabled={!canComplete}
                                className="w-full h-12"
                                size="lg"
                              >
                                {canComplete ? (
                                  <>
                                    <CheckCircle2 className="h-5 w-5 mr-2" />
                                    Mark as Complete
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="h-5 w-5 mr-2" />
                                    {subtask.requiresProof && (!subtask.proofFiles || subtask.proofFiles.length === 0)
                                      ? "Upload proof files first"
                                      : "Cannot complete yet"}
                                  </>
                                )}
                              </Button>
                            </div>
                          )}

                          {/* Unmark Button for Completed Tasks */}
                          {subtask.completed && isAssignedUser && (
                            <div className="pt-4 border-t">
                              <Button 
                                variant="outline"
                                onClick={() => handleUnmarkSubtask(subtask.id)}
                                className="w-full h-10 text-orange-600 border-orange-200 hover:bg-orange-50"
                                size="sm"
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Unmark as Complete
                              </Button>
                              <p className="text-xs text-muted-foreground text-center mt-2">
                                Click if marked complete by accident
                              </p>
                            </div>
                          )}

                          {/* Locked Task Message */}
                          {isLocked && (
                            <div className="border-muted/20 bg-muted/5 relative w-full rounded-lg border p-4 flex items-start gap-3">
                              <Lock className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="text-muted-foreground text-sm">
                                This task is locked. Complete the previous task first to unlock it.
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Overview */}
          <Card className="border-2 border-secondary/20 shadow-lg bg-gradient-to-br from-secondary/5 to-card">
            <CardHeader className="bg-gradient-to-r from-secondary/10 to-transparent">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-secondary" />
                Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full bg-secondary/10" />
                  <div className="absolute inset-2 rounded-full bg-card shadow-inner flex items-center justify-center">
                    <span className="text-2xl font-bold text-secondary">{calculatedProgress}%</span>
                  </div>
                </div>
                <Progress value={calculatedProgress} className="h-3 mb-2" />
                <p className="text-sm text-muted-foreground">Task Completion</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/20 rounded-lg">
                  <div className="text-xl font-bold text-card-foreground">{totalSubtasks}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Total</div>
                </div>
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="text-xl font-bold text-secondary">{completedSubtasks}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">Done</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Remaining:</span>
                  <span className="font-medium text-orange-600">{totalSubtasks - completedSubtasks}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Current Task:</span>
                  <span className="font-medium text-primary">
                    {currentSubtask ? `#${currentSubtaskIndex + 1}` : 'All Complete'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Task Info */}
          {currentSubtask && (
            <Card className="border-2 border-primary/20 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Current Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-primary mb-2">{currentSubtask.title}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Position:</span>
                      <span className="font-medium">#{currentSubtaskIndex + 1} of {totalSubtasks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned:</span>
                      <span className="font-medium">
                        {currentSubtask.assignedTo ? `Employee ${currentSubtask.assignedTo}` : 'Unassigned'}
                      </span>
                    </div>
                    {currentSubtask.requiresProof && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Proof:</span>
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                {!isAssignedUser && (
                  <div className="border-orange-200 bg-orange-50 relative w-full rounded-lg border p-4 flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-orange-800 text-sm">
                      Only the assigned user can work on this task.
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}