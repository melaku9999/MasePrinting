"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ArrowLeft, 
  Target,
  BarChart3,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle2,
  Zap
} from "lucide-react"
import type { Task } from "@/lib/auth"

interface CustomerTaskViewProps {
  task: Task
  onBack: () => void
}

export function CustomerTaskView({ task, onBack }: CustomerTaskViewProps) {
  const completedSubtasks = task.subtasks.filter(st => st.completed).length
  const totalSubtasks = task.subtasks.length
  const calculatedProgress = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white"
      case "in-progress": return "bg-blue-500 text-white"
      case "pending": return "bg-orange-500 text-white"
      case "cancelled": return "bg-red-500 text-white"
      default: return "bg-gray-500 text-white"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 border-red-300 bg-red-50"
      case "medium": return "text-orange-600 border-orange-300 bg-orange-50"
      case "low": return "text-green-600 border-green-300 bg-green-50"
      default: return "text-gray-600 border-gray-300 bg-gray-50"
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
  const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Header */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-xl" />
        <div className="relative p-4 sm:p-6 bg-card/80 backdrop-blur-sm border rounded-xl w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <Button variant="outline" size="sm" onClick={onBack} className="bg-card/50 backdrop-blur-sm hover:bg-card w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 w-full sm:w-auto justify-center sm:justify-start">
              Customer View
            </Badge>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground mb-2 break-words">{task.title}</h1>
              <p className="text-muted-foreground text-base sm:text-lg break-words">{task.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6 w-full">
          {/* Project Overview */}
          <Card className="border-2 border-blue-200 shadow-lg w-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
              {/* Progress Section */}
              <div className="text-center">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 sm:mb-6">
                  <div className="absolute inset-0 rounded-full bg-blue-100" />
                  <div className="absolute inset-3 rounded-full bg-card shadow-inner flex items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-blue-600">{calculatedProgress}%</span>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Project Progress</h3>
                <Progress value={calculatedProgress} className="h-3 sm:h-4 mb-2" />
                <p className="text-muted-foreground text-sm sm:text-base">
                  {calculatedProgress === 100 ? "Project completed!" :
                   calculatedProgress >= 75 ? "Nearly finished" :
                   calculatedProgress >= 50 ? "Good progress" :
                   calculatedProgress >= 25 ? "Getting started" :
                   "Just beginning"}
                </p>
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <Badge className={`${getStatusColor(task.status)} text-base sm:text-lg px-3 py-1 sm:px-4 sm:py-2 mb-2`}>
                    {task.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                </div>
                <div className="text-center p-4 bg-muted/20 rounded-lg">
                  <Badge variant="outline" className={`${getPriorityColor(task.priority)} text-base sm:text-lg px-3 py-1 sm:px-4 sm:py-2 mb-2`}>
                    {task.priority.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-muted-foreground">Priority Level</p>
                </div>
              </div>

              {/* Project Milestones - Customer-friendly view */}
              <div className="space-y-4">
                <h4 className="text-base sm:text-lg font-semibold">Project Milestones</h4>
                <div className="space-y-3">
                  {task.subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="flex items-center gap-3 p-3 bg-muted/10 rounded-lg">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        subtask.completed ? 'bg-green-500 text-white' :
                        index === task.subtasks.findIndex(st => !st.completed) ? 'bg-blue-500 text-white' :
                        'bg-gray-300 text-gray-600'
                      }`}>
                        {subtask.completed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : index === task.subtasks.findIndex(st => !st.completed) ? (
                          <Zap className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${
                          subtask.completed ? 'text-green-600 line-through' :
                          index === task.subtasks.findIndex(st => !st.completed) ? 'text-blue-600' :
                          'text-muted-foreground'
                        } break-words`}>
                          Milestone {index + 1}
                        </p>
                        <p className="text-sm text-muted-foreground break-words">
                          {subtask.completed ? 'Completed' :
                           index === task.subtasks.findIndex(st => !st.completed) ? 'In Progress' :
                           'Pending'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer Information Note */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 sm:p-6 rounded-xl border border-blue-200">
                <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  Project Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Our team is working on your project</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>You'll receive updates on major milestones</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span>Quality checks at each stage</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Dedicated support available</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6 w-full">
          {/* Project Details */}
          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-card w-full">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Due Date
                    </p>
                    <p className="text-sm font-medium break-words">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {isOverdue ? (
                      <p className="text-xs text-red-600 font-medium">
                        {Math.abs(daysUntilDue)} days overdue
                      </p>
                    ) : isDueSoon ? (
                      <p className="text-xs text-orange-600 font-medium">
                        Due in {daysUntilDue} days
                      </p>
                    ) : (
                      <p className="text-xs text-green-600 font-medium">
                        {daysUntilDue} days remaining
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Project Manager
                    </p>
                    <p className="text-sm font-medium break-words">
                      {task.assignedTo ? `Team Member ${task.assignedTo}` : 'Assigned Team'}
                    </p>
                    <p className="text-xs text-muted-foreground">Managing your project</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Milestones
                    </p>
                    <p className="text-sm font-medium">{completedSubtasks} of {totalSubtasks}</p>
                    <p className="text-xs text-muted-foreground">completed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-2 border-blue-200 shadow-lg w-full">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6">
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                <DollarSign className="h-4 w-4 mr-2" />
                View Billing
              </Button>
              <Button variant="outline" className="w-full border-2 hover:bg-blue-50">
                <Clock className="h-4 w-4 mr-2" />
                Project Timeline
              </Button>
              <Button variant="outline" className="w-full border-2 hover:bg-green-50">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}