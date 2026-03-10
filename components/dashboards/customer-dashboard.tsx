"use client"

import { useState, useEffect } from "react"
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
  Plus,
  BellRing,
  Check,
  FileImage,
  FileSpreadsheet,
  Archive,
  Clock,
  AlertCircle,
  X,
} from "lucide-react"
import { mockTasks, mockCustomers, mockFiles, mockNotifications, mockServices, type User, type Service, type Task } from "@/lib/auth"
import { mockServiceAssignments, mockChatMessages } from "@/lib/services"
import { ProfileManagement } from "@/components/profile/profile-management"
import { ServiceDetails } from "@/components/services/service-details"
import { SequentialTaskView } from "@/components/tasks/sequential-task-view"
import { CustomerTaskView } from "@/components/tasks/customer-task-view"

interface CustomerDashboardProps {
  user: User
  onLogout: () => void
  initialTab?: string
  onTabChange?: (tab: string) => void
}

export function CustomerDashboard({ user, onLogout, initialTab = "overview", onTabChange }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync activeTab when initialTab changes (e.g., via URL)
  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(mockChatMessages)
  const [searchTerm, setSearchTerm] = useState("")
  const [requestingServices, setRequestingServices] = useState<string[]>([])
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<Service | null>(null)
  const [showServiceDetails, setShowServiceDetails] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskView, setShowTaskView] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

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

  const urgentNotifications = notifications.filter((n) => n.type === "urgent" && !n.read).length
  const unreadNotifications = notifications.filter((n) => !n.read).length

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

  const handleProfileSave = (updatedUser: Partial<User>) => {
    // Handle profile update - in real app this would update the backend
    console.log("Profile updated:", updatedUser)
    // You can trigger a state update or callback here
  }

  const handleServiceSubscription = (serviceId: string) => {
    setRequestingServices(prev => [...prev, serviceId])
    // Simulate API call
    setTimeout(() => {
      console.log('Subscription requested for service:', serviceId)
      setRequestingServices(prev => prev.filter(id => id !== serviceId))
      // In a real app, this would create a new service assignment
      // and potentially trigger a notification or UI update
    }, 1500)
  }

  const handleViewServiceDetails = (service: Service) => {
    setSelectedServiceForDetails(service)
    setShowServiceDetails(true)
  }

  const handleCloseServiceDetails = () => {
    setShowServiceDetails(false)
    setSelectedServiceForDetails(null)
  }

  const isServiceSubscribed = (serviceId: string) => {
    return customerServices.some(cs => cs.serviceId === serviceId)
  }

  const handleViewTask = (task: Task) => {
    setSelectedTask(task)
    setShowTaskView(true)
  }

  const handleCloseTaskView = () => {
    setShowTaskView(false)
    setSelectedTask(null)
  }

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return FileImage
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return FileSpreadsheet
    if (fileType.includes('zip') || fileType.includes('archive')) return Archive
    return FileText
  }

  const getFileTypeColor = (fileType: string) => {
    if (fileType.includes('image')) return 'text-green-600'
    if (fileType.includes('spreadsheet') || fileType.includes('excel')) return 'text-blue-600'
    if (fileType.includes('zip') || fileType.includes('archive')) return 'text-purple-600'
    if (fileType.includes('pdf')) return 'text-red-600'
    return 'text-gray-600'
  }

  const filteredFiles = customerFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Check if we should show the customer task view */}
      {showTaskView && selectedTask ? (
        <div className="flex-1">
          <CustomerTaskView
            task={selectedTask}
            onBack={handleCloseTaskView}
          />
        </div>
      ) : (
        <>
      <aside
        className={cn(
          "bg-card border-r lg:border-b-0 border-b transition-all duration-300 flex flex-col",
          "lg:relative fixed bottom-0 left-0 right-0 z-50",
          "lg:h-auto h-16 lg:w-auto w-full",
          sidebarCollapsed ? "lg:w-16" : "lg:w-64"
        )}
      >
        {/* Sidebar Header - Hidden on mobile */}
        <div className="hidden lg:block p-4 border-b">
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
        <nav className="flex-1 lg:p-2 p-0">
          <div className="lg:space-y-1 space-y-0 lg:block flex lg:flex-col flex-row lg:overflow-visible overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const hasNotifications = item.id === "notifications" && unreadNotifications > 0
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "secondary" : "ghost"}
                  className={cn(
                    "lg:w-full w-auto lg:justify-start justify-center lg:gap-3 gap-1 lg:h-10 h-12 relative",
                    "lg:flex-row flex-col lg:px-3 px-2 lg:py-2 py-1 whitespace-nowrap flex-shrink-0",
                    sidebarCollapsed && "lg:justify-center lg:px-2"
                  )}
                  onClick={() => {
                    const nextTab = item.id === 'profile' ? 'profile' : item.id
                    setActiveTab(nextTab)
                    if (onTabChange) {
                      onTabChange(nextTab)
                    }
                  }}
                >
                  <Icon className="lg:h-4 lg:w-4 h-5 w-5 flex-shrink-0" />
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="lg:text-sm text-xs lg:inline block text-center">
                      {item.label}
                    </span>
                  )}
                  {hasNotifications && (
                    <span className="absolute lg:top-1 lg:right-1 top-0 right-0 bg-red-500 text-white text-xs rounded-full lg:h-4 lg:w-4 h-3 w-3 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* User Section - Hidden on mobile */}
        <div className="hidden lg:block p-4 border-t">
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
                onClick={() => {
                  setActiveTab('profile')
                  if (onTabChange) onTabChange('profile')
                }}
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
      <div className="flex-1 flex flex-col lg:pb-0 pb-16">
        <header className="border-b bg-card">
          <div className="flex items-center justify-between lg:px-6 px-4 lg:py-4 py-3">
            <div className="flex items-center gap-2 lg:gap-4">
              <h1 className="lg:text-2xl text-xl font-bold text-card-foreground">
                {navigationItems.find((item) => item.id === activeTab)?.label || "Dashboard"}
              </h1>
              <Badge variant="outline" className="hidden sm:inline-flex">Customer</Badge>
            </div>
            <div className="flex items-center gap-2 lg:gap-4">
              <Button
                variant="outline"
                size="sm"
                className="bg-transparent relative lg:px-4 px-2"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {unreadNotifications > 0 ? (
                  <BellRing className="h-4 w-4 lg:mr-2 mr-0 text-red-500" />
                ) : (
                  <Bell className="h-4 w-4 lg:mr-2 mr-0" />
                )}
                <span className="hidden lg:inline">Notifications</span>
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
              {/* Mobile logout button */}
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={onLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showNotifications && (
            <div className="absolute lg:right-6 right-4 top-16 lg:w-96 w-80 bg-card border rounded-lg shadow-xl z-50">
              <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-secondary/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-primary" />
                    <h3 className="font-semibold lg:text-lg text-base">Notifications</h3>
                    {unreadNotifications > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {unreadNotifications} new
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadNotifications > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllNotificationsAsRead}
                        className="text-xs h-7 px-2"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        <span className="hidden sm:inline">Mark all read</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                      className="h-7 w-7 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
              <ScrollArea className="max-h-96">
                <div className="p-2">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const getNotificationIcon = () => {
                        switch (notification.type) {
                          case 'urgent':
                            return <AlertCircle className="h-4 w-4 text-red-500" />
                          case 'payment':
                            return <CreditCard className="h-4 w-4 text-orange-500" />
                          case 'task':
                            return <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          case 'document':
                            return <FileText className="h-4 w-4 text-green-500" />
                          default:
                            return <Bell className="h-4 w-4 text-gray-500" />
                        }
                      }

                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "group relative p-3 mb-2 rounded-lg border transition-all duration-200 cursor-pointer",
                            notification.read 
                              ? "bg-muted/30 border-muted hover:bg-muted/50" 
                              : "bg-card border-border hover:shadow-md",
                            notification.type === "urgent" && !notification.read && "border-l-4 border-l-red-500 bg-red-50/50"
                          )}
                          onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getNotificationIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <p className={cn(
                                  "font-medium text-sm leading-5",
                                  notification.read ? "text-muted-foreground" : "text-foreground"
                                )}>
                                  {notification.title}
                                </p>
                                <div className="flex items-center gap-1">
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    {notification.timestamp}
                                  </span>
                                </div>
                              </div>
                              <p className={cn(
                                "text-sm mt-1 leading-5",
                                notification.read ? "text-muted-foreground" : "text-muted-foreground"
                              )}>
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <Badge 
                                  variant="outline" 
                                  className={cn(
                                    "text-xs",
                                    notification.type === "urgent" && "border-red-200 text-red-700 bg-red-50",
                                    notification.type === "payment" && "border-orange-200 text-orange-700 bg-orange-50",
                                    notification.type === "task" && "border-blue-200 text-blue-700 bg-blue-50",
                                    notification.type === "document" && "border-green-200 text-green-700 bg-green-50"
                                  )}
                                >
                                  {notification.type}
                                </Badge>
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markNotificationAsRead(notification.id)
                                    }}
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No notifications</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-3 border-t bg-muted/20">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      setActiveTab('notifications')
                      setShowNotifications(false)
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Content Area */}
        <div className="flex-1 lg:p-6 p-4 overflow-auto">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
                    <div className="text-2xl font-bold text-secondary">${(customer?.prepaymentBalance ?? 0).toFixed(2)}</div>
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
            <div className="space-y-6">
              {/* Subscribed Services Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                      My Active Services
                    </CardTitle>
                    <Badge variant="secondary" className="text-sm">
                      {customerServices.length} Subscribed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {customerServices.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {customerServices.map((assignment) => {
                        const service = mockServices.find(s => s.id === assignment.serviceId)
                        if (!service) return null
                        return (
                          <Card key={assignment.id} className="border-2 border-secondary/20">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{service.name}</CardTitle>
                                <Badge 
                                  variant={assignment.status === "active" ? "default" : "secondary"}
                                  className={assignment.status === "active" ? "bg-secondary text-secondary-foreground" : ""}
                                >
                                  {assignment.status}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <p className="text-sm text-muted-foreground">{service.description}</p>
                              
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-semibold">
                                  ${assignment.customPrice || service.price}
                                </span>
                                <Badge variant="outline">{service.category}</Badge>
                              </div>

                              {assignment.notes && (
                                <div className="p-2 bg-muted/50 rounded text-sm">
                                  <span className="font-medium">Notes:</span> {assignment.notes}
                                </div>
                              )}

                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                                <span>Started: {new Date(assignment.assignedDate).toLocaleDateString()}</span>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    const service = mockServices.find(s => s.id === assignment.serviceId)
                                    if (service) handleViewServiceDetails(service)
                                  }}
                                >
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">You don't have any active services yet.</p>
                      <p className="text-sm text-muted-foreground">Browse available services below to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Services Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Available Services
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {mockServices.filter(service => 
                        !customerServices.some(cs => cs.serviceId === service.id)
                      ).length} Available
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search services..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="max-w-sm"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockServices
                      .filter(service => {
                        // Filter out already subscribed services
                        const isSubscribed = customerServices.some(cs => cs.serviceId === service.id)
                        // Filter by search term
                        const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            service.description.toLowerCase().includes(searchTerm.toLowerCase())
                        return !isSubscribed && matchesSearch
                      })
                      .map((service) => (
                        <Card key={service.id} className="hover:shadow-md transition-shadow border border-muted">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{service.name}</CardTitle>
                              <Badge variant="outline">{service.category}</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                            
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold text-lg text-primary">${service.price}</span>
                            </div>

                            {service.requiresLicense && (
                              <Badge variant="secondary" className="w-fit text-xs">
                                Requires License
                              </Badge>
                            )}

                            {service.subtasks && service.subtasks.length > 0 && (
                              <div className="text-xs text-muted-foreground">
                                <span className="font-medium">Includes:</span>
                                <ul className="mt-1 space-y-1">
                                  {service.subtasks.slice(0, 2).map((subtask) => (
                                    <li key={subtask.id} className="flex items-center gap-1">
                                      <div className="w-1 h-1 bg-muted-foreground rounded-full" />
                                      {subtask.title}
                                    </li>
                                  ))}
                                  {service.subtasks.length > 2 && (
                                    <li className="text-muted-foreground/70">
                                      +{service.subtasks.length - 2} more tasks
                                    </li>
                                  )}
                                </ul>
                              </div>
                            )}

                            <div className="flex gap-2 pt-2">
                              <Button 
                                size="sm" 
                                className="flex-1"
                                disabled={requestingServices.includes(service.id)}
                                onClick={() => handleServiceSubscription(service.id)}
                              >
                                {requestingServices.includes(service.id) ? "Requesting..." : "Subscribe"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewServiceDetails(service)}
                              >
                                Details
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    }
                  </div>
                  
                  {mockServices.filter(service => 
                    !customerServices.some(cs => cs.serviceId === service.id) &&
                    (service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                     service.description.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).length === 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm ? "No services found matching your search." : "No services available for subscription."}
                      </p>
                      {searchTerm && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-2"
                          onClick={() => setSearchTerm("")}
                        >
                          Clear Search
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "tasks" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
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
                        <div className="flex items-center gap-2">
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
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewTask(task)}
                            className="h-8 px-3 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Task
                          </Button>
                        </div>
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
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Folder className="h-5 w-5 text-primary" />
                      My Box Files
                    </CardTitle>
                    <Badge variant="outline" className="text-sm">
                      {customerFiles.length} {customerFiles.length === 1 ? 'file' : 'files'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search files by name or type..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    {/* Upload functionality removed - only admins can upload files */}
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredFiles.length > 0 ? (
                    <div className="space-y-3">
                      {filteredFiles.map((file) => {
                        const FileIcon = getFileIcon(file.type)
                        const fileColorClass = getFileTypeColor(file.type)
                        
                        return (
                          <div 
                            key={file.id} 
                            className="group p-4 border border-border rounded-lg hover:shadow-md transition-all duration-200 bg-card"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center border">
                                  <FileIcon className={cn("h-6 w-6", fileColorClass)} />
                                </div>
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="font-medium text-foreground truncate">{file.name}</h4>
                                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <FileText className="h-3 w-3" />
                                        {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {new Date(file.uploadedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    {file.taskId && (
                                      <div className="mt-2">
                                        <Badge variant="outline" className="text-xs">
                                          Related to: {mockTasks.find(t => t.id === file.taskId)?.title || 'Unknown Task'}
                                        </Badge>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="outline" size="sm" className="h-8 px-3">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Preview
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8 px-3">
                                      <Download className="h-3 w-3 mr-1" />
                                      Download
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="font-medium text-foreground mb-2">
                        {searchTerm ? "No files found" : "No files uploaded yet"}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        {searchTerm ? 
                          "Try adjusting your search terms to find what you're looking for." : 
                          "Your account administrator will upload files and documents related to your projects."
                        }
                      </p>
                      {searchTerm ? (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSearchTerm("")}>
                          Clear Search
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Files will be uploaded by your account administrator.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* File Statistics */}
              {customerFiles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Files</p>
                          <p className="text-xl font-bold">{customerFiles.length}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <DollarSign className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total Size</p>
                          <p className="text-xl font-bold">
                            {(customerFiles.reduce((sum, file) => sum + file.size, 0) / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Last Upload</p>
                          <p className="text-sm font-bold">
                            {customerFiles.length > 0 
                              ? new Date(Math.max(...customerFiles.map(f => new Date(f.uploadedAt).getTime()))).toLocaleDateString()
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
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
            <div className="space-y-6">
              {/* Notifications Header */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BellRing className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">All Notifications</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          Stay up to date with your account and projects
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotifications > 0 && (
                        <Badge variant="destructive">
                          {unreadNotifications} unread
                        </Badge>
                      )}
                      {unreadNotifications > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={markAllNotificationsAsRead}
                          className="gap-2"
                        >
                          <Check className="h-4 w-4" />
                          Mark all as read
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Notifications List */}
              <div className="space-y-3">
                {notifications.length > 0 ? (
                  notifications.map((notification) => {
                    const getNotificationIcon = () => {
                      switch (notification.type) {
                        case 'urgent':
                          return <AlertCircle className="h-5 w-5 text-red-500" />
                        case 'payment':
                          return <CreditCard className="h-5 w-5 text-orange-500" />
                        case 'task':
                          return <CheckCircle2 className="h-5 w-5 text-blue-500" />
                        case 'document':
                          return <FileText className="h-5 w-5 text-green-500" />
                        default:
                          return <Bell className="h-5 w-5 text-gray-500" />
                      }
                    }

                    return (
                      <Card 
                        key={notification.id} 
                        className={cn(
                          "group transition-all duration-200 cursor-pointer",
                          notification.read 
                            ? "bg-muted/30 hover:bg-muted/50" 
                            : "hover:shadow-md",
                          notification.type === "urgent" && !notification.read && "border-l-4 border-l-red-500"
                        )}
                        onClick={() => !notification.read && markNotificationAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">
                              {getNotificationIcon()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                  <h4 className={cn(
                                    "font-medium text-base mb-1",
                                    notification.read ? "text-muted-foreground" : "text-foreground"
                                  )}>
                                    {notification.title}
                                  </h4>
                                  <p className={cn(
                                    "text-sm leading-5 mb-3",
                                    notification.read ? "text-muted-foreground" : "text-muted-foreground"
                                  )}>
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-xs",
                                        notification.type === "urgent" && "border-red-200 text-red-700 bg-red-50",
                                        notification.type === "payment" && "border-orange-200 text-orange-700 bg-orange-50",
                                        notification.type === "task" && "border-blue-200 text-blue-700 bg-blue-50",
                                        notification.type === "document" && "border-green-200 text-green-700 bg-green-50"
                                      )}
                                    >
                                      {notification.type}
                                    </Badge>
                                    {notification.type === "urgent" && !notification.read && (
                                      <Badge variant="destructive" className="text-xs">
                                        Urgent
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {notification.timestamp}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0" />
                                  )}
                                  {!notification.read && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-3"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        markNotificationAsRead(notification.id)
                                      }}
                                    >
                                      <Check className="h-3 w-3 mr-1" />
                                      Mark as read
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                ) : (
                  <Card>
                    <CardContent className="p-12">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
                          <Bell className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-medium text-foreground mb-2">No notifications</h3>
                        <p className="text-sm text-muted-foreground">
                          You're all caught up! We'll notify you when there's something new.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {activeTab === "profile" && (
            <ProfileManagement
              user={user}
              onSave={handleProfileSave}
              showBackButton={false}
              inline={true}
            />
          )}
        </div>
      </div>

      {selectedServiceForDetails && (
          <ServiceDetails
            service={selectedServiceForDetails}
            onClose={handleCloseServiceDetails}
            onEdit={() => {}}
            onAssign={() => {}}
          />
      )}
        </>
      )}
    </div>
  )
}
