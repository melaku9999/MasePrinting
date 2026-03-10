"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  DollarSign,
  FileText,
  Calendar,
  Building,
  CreditCard,
  MessageSquare,
  Search,
  Folder,
  ChevronRight,
  Plus,
  BellRing,
  Check,
  FileImage,
  FileSpreadsheet,
  Archive,
  AlertCircle,
  X,
  Bell,
} from "lucide-react"
import { mockTasks, mockCustomers, mockFiles, mockNotifications, mockServices, type User, type Service, type Task } from "@/lib/auth"
import { mockServiceAssignments, mockChatMessages } from "@/lib/services"
import { ProfileManagement } from "@/components/profile/profile-management"
import { ServiceDetails } from "@/components/services/service-details"
import { CustomerTaskView } from "@/components/tasks/customer-task-view"
import { SequentialTaskView } from "@/components/tasks/sequential-task-view"

interface CustomerDashboardProps {
  user: User
  initialTab?: string
}

export function CustomerDashboard({ user, initialTab = "overview" }: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab)
    }
  }, [initialTab])

  const [chatMessage, setChatMessage] = useState("")
  const [chatMessages, setChatMessages] = useState(mockChatMessages)
  const [searchTerm, setSearchTerm] = useState("")
  const [requestingServices, setRequestingServices] = useState<string[]>([])
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<Service | null>(null)
  const [showServiceDetails, setShowServiceDetails] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showTaskView, setShowTaskView] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)

  const customer = mockCustomers[0] // Mock: assume first customer
  const customerTasks = mockTasks.filter((task) => task.customerId === customer.id)
  const customerServices = mockServiceAssignments.filter((service) => service.customerId === customer.id)
  const customerFiles = mockFiles.filter((file) => file.customerId === customer.id)

  const activeTasks = customerTasks.filter((task) => task.status === "in-progress")
  const unreadNotifications = notifications.filter((n) => !n.read).length

  const handleProfileSave = (updatedUser: Partial<User>) => {
    console.log("Profile updated:", updatedUser)
  }

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

  const handleServiceSubscription = (serviceId: string) => {
    setRequestingServices(prev => [...prev, serviceId])
    setTimeout(() => {
      console.log('Subscription requested for service:', serviceId)
      setRequestingServices(prev => prev.filter(id => id !== serviceId))
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

  const filteredFiles = customerFiles.filter(
    (file) =>
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (showTaskView && selectedTask) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <CustomerTaskView
          task={selectedTask}
          onBack={handleCloseTaskView}
        />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
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
                    <div key={task.id} className="p-4 bg-muted rounded-lg" onClick={() => handleViewTask(task)}>
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
                    <p className="text-sm text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Status</p>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>{customer.status}</Badge>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Information</p>
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                  <p className="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Active Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customerServices.map((assignment) => {
                  const service = mockServices.find(s => s.id === assignment.serviceId)
                  if (!service) return null
                  return (
                    <Card key={assignment.id} className="border-2 border-secondary/20">
                      <CardHeader className="pb-3 text-lg font-bold">
                        {service.name}
                        <Badge variant="secondary">{assignment.status}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
                        <Button variant="outline" size="sm" onClick={() => handleViewServiceDetails(service)}>View Details</Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServices.map((service) => (
              <Card key={service.id} className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{service.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg">${service.price}</span>
                    <Button 
                      size="sm" 
                      disabled={isServiceSubscribed(service.id) || requestingServices.includes(service.id)}
                      onClick={() => handleServiceSubscription(service.id)}
                    >
                      {isServiceSubscribed(service.id) ? "Subscribed" : requestingServices.includes(service.id) ? "Requesting..." : "Subscribe"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Project Status</h2>
            <Badge variant="outline">{customerTasks.length} Projects</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {customerTasks.map((task) => (
              <Card key={task.id} className="hover:border-primary/50 transition-all cursor-pointer group" onClick={() => handleViewTask(task)}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">{task.title}</CardTitle>
                    <Badge className={cn(
                      task.status === "completed" ? "bg-green-500" :
                      task.status === "in-progress" ? "bg-blue-500" :
                      "bg-orange-500"
                    )}>
                      {task.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span>Overall Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <Progress value={task.progress} className="h-2" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-primary group-hover:translate-x-1 transition-transform">
                      View Details <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "files" && (
        <Card>
          <CardHeader>
            <CardTitle>My Box Files</CardTitle>
            <div className="flex items-center gap-2 mt-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFiles.map((file) => {
                const Icon = getFileIcon(file.type)
                return (
                  <Card key={file.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.size} • {new Date(file.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "chat" && (
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b">
            <CardTitle>Chat Support</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className={cn("flex", msg.sender === "customer" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[80%] rounded-lg p-3", msg.sender === "customer" ? "bg-primary text-primary-foreground" : "bg-muted")}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-[10px] opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t flex gap-2">
              <Input 
                placeholder="Type your message..." 
                value={chatMessage} 
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "notifications" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Notifications</h2>
            <Button variant="outline" size="sm" onClick={markAllNotificationsAsRead}>Mark all as read</Button>
          </div>
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card key={notification.id} className={cn("p-4", !notification.read && "bg-primary/5")}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Bell className={cn("h-5 w-5 mt-0.5", notification.type === "urgent" ? "text-red-500" : "text-primary")} />
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                    </div>
                  </div>
                  {!notification.read && <Badge variant="secondary">New</Badge>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "profile" && (
        <ProfileManagement user={user} onSave={handleProfileSave} showBackButton={false} inline={true} />
      )}

      {selectedServiceForDetails && (
        <ServiceDetails
          service={selectedServiceForDetails}
          onClose={handleCloseServiceDetails}
          onEdit={() => {}}
          onAssign={() => {}}
        />
      )}
    </div>
  )
}
