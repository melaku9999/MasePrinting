"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  DollarSign,
  FileText,
  LogOut,
  Bell,
  Calendar,
  Building,
  CreditCard,
  MessageSquare,
  Send,
  Search,
  Download,
  Eye,
  Folder,
  Home,
  ChevronLeft,
  ChevronRight,
  Settings,
} from "lucide-react"
import { mockTasks, mockCustomers, mockFiles, mockNotifications, type User } from "@/lib/auth"
import { mockServiceAssignments, mockChatMessages } from "@/lib/services"

interface CustomerDashboardProps {
  user: User
  onLogout: () => void
}

export function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(mockChatMessages)
  const [searchTerm, setSearchTerm] = useState("")

  const navigationItems = [
    { id: "overview", label: "Overview", icon: Home },
    { id: "services", label: "My Services", icon: Building },
    { id: "tasks", label: "Project Status", icon: CheckCircle2 },
    { id: "files", label: "Box Files", icon: Folder },
    { id: "chat", label: "Chat Support", icon: MessageSquare },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "profile", label: "Profile Settings", icon: Settings },
  ]

  const customer = mockCustomers[0] // Mock: assume first customer
  const customerTasks = mockTasks.filter((task) => task.customerId === customer.id)
  const customerServices = mockServiceAssignments.filter((service) => service.customerId === customer.id)
  const customerFiles = mockFiles.filter((file) => file.customerId === customer.id)

  const activeTasks = customerTasks.filter((task) => task.status === "in-progress")
  const completedTasks = customerTasks.filter((task) => task.status === "completed")
  const pendingTasks = customerTasks.filter((task) => task.status === "pending")

  const urgentNotifications = mockNotifications.filter((n) => n.type === "urgent").length

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        {
          id: chatMessages.length + 1,
          sender: "customer",
          message: chatMessage,
          timestamp: new Date(),
        },
      ])
      setChatMessage("")
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: prev.length + 1,
            sender: "support",
            message: "Thank you for your message. We'll get back to you shortly!",
            timestamp: new Date(),
          },
        ])
      }, 2000)
    }
  }

  const handleProfileNavigation = () => {
    window.location.href = '/customer/profile'
  }

  const filteredFiles = customerFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background flex">
      <aside
        className={cn("bg-card border-r transition-all duration-300 flex flex-col", sidebarCollapsed ? "w-16" : "w-64")}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div>
                <h2 className="text-lg font-semibold text-card-foreground">Customer Portal</h2>
                <p className="text-sm text-muted-foreground">Your Dashboard</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const hasNotifications = item.id === "notifications" && urgentNotifications > 0
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn("w-full justify-start gap-3 h-10 relative", sidebarCollapsed && "justify-center px-2")}
                  onClick={() => {
                    if (item.id === 'profile') {
                      handleProfileNavigation()
                    } else {
                      setActiveTab(item.id)
                    }
                  }}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                  {hasNotifications && (
                    <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                      {urgentNotifications}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">{customer.name.charAt(0)}</span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{customer.name}</p>
                <p className="text-xs text-muted-foreground">Customer</p>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="mt-3 space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start gap-2 h-8"
                onClick={handleProfileNavigation}
              >
                <Settings className="h-3 w-3" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start gap-2 h-8" onClick={onLogout}>
                <LogOut className="h-3 w-3" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-card-foreground">
                {navigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge variant="outline">Customer</Badge>
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
                {urgentNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {urgentNotifications}
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
                {mockNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b hover:bg-muted ${notification.type === "urgent" ? "bg-red-50 border-l-4 border-l-red-500" : ""}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-sm text-muted-foreground">{notification.message}</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notification.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{customerServices.length}</div>
                    <p className="text-xs text-muted-foreground">Currently subscribed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">{activeTasks.length}</div>
                    <p className="text-xs text-muted-foreground">In progress</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Prepayment Balance</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary">${customer.prepaymentBalance.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Available credit</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Box Files</CardTitle>
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600">{customerFiles.length}</div>
                    <p className="text-xs text-muted-foreground">Total documents</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Projects</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {activeTasks.length > 0 ? (
                      activeTasks.map((task) => (
                        <div key={task.id} className="p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge className="bg-primary text-primary-foreground">{task.status}</Badge>
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
                              <CheckCircle2 className="h-3 w-3" />
                              {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-8">No active projects</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium">Customer Since</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account Status</p>
                        <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                          {customer.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Contact Information</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Billing Address</p>
                      <p className="text-sm text-muted-foreground">{customer.address}</p>
                    </div>

                    <div className="pt-4">
                      <Button className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Add Prepayment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button className="h-16 flex flex-col gap-1" onClick={() => setActiveTab("tasks")}>
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="text-sm">View Projects</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-1 bg-transparent"
                      onClick={() => setActiveTab("chat")}
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-sm">Chat Support</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-1 bg-transparent"
                      onClick={() => setActiveTab("files")}
                    >
                      <FileText className="h-5 w-5" />
                      <span className="text-sm">My Box File</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 flex flex-col gap-1 bg-transparent"
                      onClick={() => setActiveTab("notifications")}
                    >
                      <Bell className="h-5 w-5" />
                      <span className="text-sm">Notifications</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "services" && (
            <Card>
              <CardHeader>
                <CardTitle>My Services</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {customerServices.map((service) => (
                  <div key={service.id} className="p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Service {service.serviceId}</h4>
                      <Badge variant={service.status === "active" ? "default" : "secondary"}>{service.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{service.notes}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Assigned: {new Date(service.assignedDate).toLocaleDateString()}</span>
                      {service.customPrice && <span>Price: ${service.customPrice.toFixed(2)}</span>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Pending</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-600 mb-2">{pendingTasks.length}</div>
                    <p className="text-sm text-muted-foreground">Projects waiting to start</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary mb-2">{activeTasks.length}</div>
                    <p className="text-sm text-muted-foreground">Currently active projects</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Completed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-secondary mb-2">{completedTasks.length}</div>
                    <p className="text-sm text-muted-foreground">Successfully finished</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Projects</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerTasks.map((task) => (
                    <div key={task.id} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{task.title}</h4>
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
                          <CheckCircle2 className="h-3 w-3" />
                          {task.subtasks.filter((st) => st.completed).length}/{task.subtasks.length} subtasks
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "files" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5" />
                  My Box Files
                </CardTitle>
                <div className="flex items-center gap-2 mt-4">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search files..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-primary" />
                          <div>
                            <p className="font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {file.type} • {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No files found matching your search" : "No files uploaded yet"}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "chat" && (
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat Support
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 pr-4 mb-4">
                  <div className="space-y-4">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "customer" ? "justify-end" : "justify-start"}`}
                      >
                        <div className="flex items-start gap-2 max-w-[70%]">
                          {message.sender === "support" && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                          )}
                          <div
                            className={`p-3 rounded-lg ${
                              message.sender === "customer" ? "bg-primary text-primary-foreground" : "bg-muted"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                          {message.sender === "customer" && (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>C</AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>All Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${notification.type === "urgent" ? "bg-red-50 border-red-200" : "bg-muted"}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{notification.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge
                              variant={
                                notification.type === "task"
                                  ? "default"
                                  : notification.type === "payment"
                                    ? "destructive"
                                    : "secondary"
                              }
                            >
                              {notification.type}
                            </Badge>
                            {notification.type === "urgent" && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
