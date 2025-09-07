"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileUpload } from "@/components/files/file-upload"
import { FileViewer } from "@/components/files/file-viewer"
import { TaskDetails } from "@/components/tasks/task-details"
import { BoxFileManagement } from "@/components/files/box-file-management"
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileText,
  LogOut,
  Bell,
  Calendar,
  Search,
  FolderOpen,
  ImageIcon,
  Archive,
  MoreVertical,
  Upload,
  Eye,
  Download,
  Menu,
  Home,
  Folder,
  Settings,
} from "lucide-react"
import { mockTasks, mockCustomers, mockFiles } from "@/lib/auth"
import type { User as AuthUser, BoxFile } from "@/lib/auth"

interface EmployeeDashboardProps {
  user: AuthUser
  onLogout: () => void
}

export function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [focusedTask, setFocusedTask] = useState<any>(null)
  const [showNotifications, setShowNotifications] = useState(false)
  const [additionalCosts, setAdditionalCosts] = useState<{ [key: string]: { amount: number; comment: string } }>({})
  const [proofOfWork, setProofOfWork] = useState<{ [key: string]: File[] }>({})
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null)
  const [viewingFile, setViewingFile] = useState<any>(null)
  const [selectedBoxFile, setSelectedBoxFile] = useState("")
  const [viewMode, setViewMode] = useState<"list" | "view">("list")
  const [selectedTask, setSelectedTask] = useState<any>(null)

  const myTasks = mockTasks.filter((task) => task.assignedTo === user.id)
  const pendingTasks = myTasks.filter((task) => task.status === "pending")
  const inProgressTasks = myTasks.filter((task) => task.status === "in-progress")
  const completedTasks = myTasks.filter((task) => task.status === "completed")

  const overdueTasks = myTasks.filter((task) => {
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate < today && task.status !== "completed"
  })

  const urgentTasks = myTasks.filter((task) => task.priority === "high" && task.status !== "completed")

  const assignedCustomerIds = [...new Set(myTasks.map((task) => task.customerId))]
  const accessibleCustomers = mockCustomers.filter((customer) => assignedCustomerIds.includes(customer.id))

  const boxFiles = accessibleCustomers.map((customer) => ({
    customer,
    files: mockFiles.filter((file) => file.customerId === customer.id),
    totalSize: mockFiles.filter((file) => file.customerId === customer.id).reduce((sum, file) => sum + file.size, 0),
  }))

  const filteredBoxFiles = boxFiles.filter(
    (boxFile) =>
      boxFile.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      boxFile.files.some((file) => file.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const notifications = [
    ...urgentTasks.map((task) => ({
      id: `urgent-${task.id}`,
      type: "urgent",
      title: "Urgent Task",
      message: `${task.title} requires immediate attention`,
      time: "now",
    })),
    {
      id: "new-task",
      type: "info",
      title: "New Task Assigned",
      message: "You have been assigned a new customer onboarding task",
      time: "2 hours ago",
    },
  ]

  const handleSubtaskComplete = (taskId: string, subtaskId: string, completed: boolean) => {
    console.log(`Subtask ${subtaskId} in task ${taskId} marked as ${completed ? "completed" : "incomplete"}`)
  }

  const handleAddCost = (subtaskId: string, amount: number, comment: string) => {
    setAdditionalCosts((prev) => ({
      ...prev,
      [subtaskId]: { amount, comment },
    }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    if (type.includes("zip") || type.includes("archive")) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const sidebarItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "tasks", label: "My Tasks", icon: CheckCircle2 },
    { id: "files", label: "Box Files", icon: Folder },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ]

  // Handler for viewing a task (for View button)
  const handleViewTask = (task: any) => {
    setSelectedTask(task)
    setViewMode("view")
  }

  const handleBackToList = () => {
    setSelectedTask(null)
    setViewMode("list")
  }

  const handleProfileNavigation = () => {
    window.location.href = '/employee/profile'
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className={`${sidebarOpen ? "w-64" : "w-16"} bg-card border-r transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
              <Menu className="h-4 w-4" />
            </Button>
            {sidebarOpen && (
              <div>
                <h2 className="font-semibold text-card-foreground">Employee Portal</h2>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 ${!sidebarOpen && "px-2"}`}
                  onClick={() => {
                    if (item.id === 'profile') {
                      handleProfileNavigation()
                    } else {
                      setActiveTab(item.id)
                    }
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && <span>{item.label}</span>}
                </Button>
              )
            })}
          </div>
        </nav>

        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50 ${!sidebarOpen && "px-2"}`}
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen && <span>Logout</span>}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-card-foreground">Employee Dashboard</h1>
              <Badge variant="outline">Employee</Badge>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell className="h-4 w-4 mr-2" />
                Notifications
                {urgentTasks.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {urgentTasks.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {showNotifications && (
            <div className="absolute right-6 top-16 w-80 bg-card border rounded-lg shadow-lg z-50">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted ${notification.type === "urgent" ? "bg-red-50 border-l-4 border-l-red-500" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">{notification.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Task Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{pendingTasks.length}</div>
                    <p className="text-xs text-muted-foreground">Awaiting start</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{inProgressTasks.length}</div>
                    <p className="text-xs text-muted-foreground">Currently working</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">{completedTasks.length}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                    <p className="text-xs text-muted-foreground">Need attention</p>
                  </CardContent>
                </Card>
              </div>

              {/* Current Tasks & Upcoming Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Tasks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inProgressTasks.length > 0 ? (
                      inProgressTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className="p-4 bg-muted rounded-lg cursor-pointer hover:bg-muted/80"
                          onClick={() => setFocusedTask(task)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className="bg-primary text-primary-foreground">{task.priority}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-2" />
                          </div>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <span>Customer {task.customerId}</span>
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No tasks in progress</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      Upcoming Deadlines
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {myTasks
                      .filter((task) => task.status !== "completed")
                      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                      .slice(0, 4)
                      .map((task) => {
                        const daysUntilDue = Math.ceil(
                          (new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )
                        const isOverdue = daysUntilDue < 0
                        const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0

                        return (
                          <div key={task.id} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                isOverdue ? "bg-red-600" : isDueSoon ? "bg-orange-600" : "bg-secondary"
                              }`}
                            ></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{task.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {isOverdue ? `${Math.abs(daysUntilDue)} days overdue` : `Due in ${daysUntilDue} days`}
                              </p>
                            </div>
                            <Badge variant={task.priority === "high" ? "destructive" : "outline"}>
                              {task.priority}
                            </Badge>
                          </div>
                        )
                      })}
                    {myTasks.filter((task) => task.status !== "completed").length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No upcoming deadlines</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button className="h-20 flex flex-col gap-2" onClick={() => setActiveTab("tasks")}>
                      <CheckCircle2 className="h-6 w-6" />
                      View All Tasks
                    </Button>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                      <Calendar className="h-6 w-6" />
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col gap-2 bg-transparent"
                      onClick={() => setActiveTab("files")}
                    >
                      <FileText className="h-6 w-6" />
                      Upload Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">My Tasks</h2>
                <Badge variant="outline">{myTasks.length} Total Tasks</Badge>
              </div>

              {viewMode === "view" && selectedTask ? (
                <TaskDetails
                  task={selectedTask}
                  onEdit={() => {}}
                  onBack={handleBackToList}
                  allowSubtaskCreation={true}
                />
              ) : (
                <div className="space-y-4">
                  {myTasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">{task.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={
                                task.priority === "high"
                                  ? "destructive"
                                  : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {task.priority}
                            </Badge>
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "default"
                                  : task.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-muted-foreground mb-4">{task.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            <Progress value={task.progress} className="w-24 h-2" />
                            <span className="text-sm">{task.progress}%</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewTask(task)}
                            className="flex items-center gap-1 bg-transparent"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "files" && <BoxFileManagement />}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${notification.type === "urgent" ? "bg-red-50 border-red-200" : "bg-muted"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* File Viewer Dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={() => setViewingFile(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{viewingFile.name}</DialogTitle>
            </DialogHeader>
            <FileViewer 
              file={viewingFile} 
              onBack={() => setViewingFile(null)}
              onDelete={() => {
                console.log("Delete file:", viewingFile.id)
                setViewingFile(null)
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Detailed Customer Files Dialog */}
      {selectedCustomer && (
        <Dialog open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>{mockCustomers.find((c) => c.id === selectedCustomer)?.name} - Box File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {mockFiles
                .filter((file) => file.customerId === selectedCustomer)
                .map((file) => (
                  <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    {getFileIcon(file.type)}
                    <div className="flex-1">
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setViewingFile(file)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {focusedTask && (
        <Dialog open={!!focusedTask} onOpenChange={() => setFocusedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{focusedTask.title}</span>
                <Badge variant={focusedTask.priority === "high" ? "destructive" : "default"}>
                  {focusedTask.priority}
                </Badge>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-muted-foreground">{focusedTask.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Subtasks ({focusedTask.subtasks?.length || 0})</h4>
                <div className="space-y-3">
                  {focusedTask.subtasks?.map((subtask: any, index: number) => (
                    <div key={subtask.id} className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={subtask.completed}
                          onCheckedChange={(checked) =>
                            handleSubtaskComplete(focusedTask.id, subtask.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <h5 className="font-medium">{subtask.title}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{subtask.description}</p>

                          {subtask.requiresProof && (
                            <div className="mt-3 p-3 bg-muted rounded">
                              <Label className="text-sm font-medium">Proof of Work Required</Label>
                              <div className="mt-2">
                                <Input
                                  type="file"
                                  multiple
                                  className="text-sm"
                                  onChange={(e) => {
                                    if (e.target.files) {
                                      setProofOfWork((prev) => ({
                                        ...prev,
                                        [subtask.id]: Array.from(e.target.files!),
                                      }))
                                    }
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          <div className="mt-3 p-3 bg-muted rounded">
                            <Label className="text-sm font-medium">Additional Costs</Label>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={additionalCosts[subtask.id]?.amount || ""}
                                onChange={(e) =>
                                  handleAddCost(
                                    subtask.id,
                                    Number.parseFloat(e.target.value) || 0,
                                    additionalCosts[subtask.id]?.comment || "",
                                  )
                                }
                              />
                              <Input
                                placeholder="Comment"
                                value={additionalCosts[subtask.id]?.comment || ""}
                                onChange={(e) =>
                                  handleAddCost(subtask.id, additionalCosts[subtask.id]?.amount || 0, e.target.value)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) || <p className="text-muted-foreground">No subtasks defined</p>}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Progress: {focusedTask.progress}%</span>
                  <Progress value={focusedTask.progress} className="w-32" />
                </div>
                <Button onClick={() => setFocusedTask(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
