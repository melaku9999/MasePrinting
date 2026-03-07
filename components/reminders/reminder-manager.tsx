"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  PlusCircle, 
  Edit3, 
  Clock, 
  CheckCircle, 
  Calendar,
  Bell,
  AlarmClock,
  Search,
  Filter,
  Target,
  BarChart3,
  User,
  Clock4,
  Repeat
} from "lucide-react"
import { Reminder, mockReminders } from "@/lib/auth"
import { remindersApi } from "@/lib/api"
import { getAuthToken } from "@/lib/auth"
import { format } from "date-fns"

export function ReminderManager() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAlarmModalOpen, setIsAlarmModalOpen] = useState(false)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
  const [alarmReminder, setAlarmReminder] = useState<Reminder | null>(null)
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    scheduledTime: "",
    repeat: "none" as "none" | "daily" | "weekly" | "monthly"
  })
  const [snoozeDuration, setSnoozeDuration] = useState(5) // Default 5 minutes
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch reminders from API
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        setLoading(true)
        const response = await remindersApi.getAll()
        if (response.success) {
          const reminders = (response.reminders as any[]).map(r => ({
            ...r,
            status: r.status as "pending" | "snoozed" | "done"
          }))
          setReminders(reminders)
          setFilteredReminders(reminders)
          setError(null)
        } else {
          setError("Failed to fetch reminders")
          // Fallback to mock data
          setReminders(mockReminders)
          setFilteredReminders(mockReminders)
        }
      } catch (err) {
        setError("Error fetching reminders")
        console.error(err)
        // Fallback to mock data
        setReminders(mockReminders)
        setFilteredReminders(mockReminders)
      } finally {
        setLoading(false)
      }
    }

    fetchReminders()
  }, [])

  // Filter reminders
  useEffect(() => {
    let result = [...reminders]
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(reminder => 
        reminder.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reminder.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(reminder => reminder.status === statusFilter)
    }
    
    setFilteredReminders(result)
  }, [searchTerm, statusFilter, reminders])

  // Check for reminders that are due
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date()
      
      reminders.forEach(reminder => {
        if (reminder.status === "pending" || reminder.status === "snoozed") {
          const scheduledTime = new Date(reminder.scheduledTime)
          
          // Check if reminder is due
          if (scheduledTime <= now) {
            // If it's a snoozed reminder, check if snooze time has passed
            if (reminder.status === "snoozed" && reminder.snoozeUntil) {
              const snoozeUntil = new Date(reminder.snoozeUntil)
              if (now >= snoozeUntil) {
                triggerAlarm(reminder)
              }
            } else if (reminder.status === "pending") {
              triggerAlarm(reminder)
            }
          }
        }
      })
    }

    // Check every 30 seconds
    intervalRef.current = setInterval(checkReminders, 30000)
    checkReminders() // Initial check

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [reminders])

  const triggerAlarm = (reminder: Reminder) => {
    setAlarmReminder(reminder)
    setIsAlarmModalOpen(true)
    
    // Play alarm sound
    if (audioRef.current) {
      audioRef.current.loop = true
      audioRef.current.play().catch(e => console.log("Audio play failed:", e))
    }
  }

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsAlarmModalOpen(false)
    setAlarmReminder(null)
  }

  const handleCreateReminder = async () => {
    if (!newReminder.title || !newReminder.scheduledTime) return

    try {
      const response = await remindersApi.create({
        title: newReminder.title,
        description: newReminder.description,
        scheduledTime: newReminder.scheduledTime,
        repeat: newReminder.repeat
      })

      if (response.success) {
        const reminder = {
          ...response.reminder,
          status: response.reminder.status as "pending" | "snoozed" | "done"
        }
        setReminders(prev => [...prev, reminder])
        setFilteredReminders(prev => [...prev, reminder])
        setNewReminder({ title: "", description: "", scheduledTime: "", repeat: "none" })
        setIsCreateModalOpen(false)
      } else {
        alert("Failed to create reminder")
      }
    } catch (error) {
      console.error("Error creating reminder:", error)
      alert("Error creating reminder")
    }
  }

  const handleEditReminder = async () => {
    if (!editingReminder || !editingReminder.title || !editingReminder.scheduledTime) return

    try {
      const response = await remindersApi.update(editingReminder.id, {
        title: editingReminder.title,
        description: editingReminder.description,
        scheduledTime: editingReminder.scheduledTime,
        repeat: editingReminder.repeat,
        status: editingReminder.status
      })

      if (response.success) {
        const updatedReminder = {
          ...response.reminder,
          status: response.reminder.status as "pending" | "snoozed" | "done"
        }
        const updatedReminders = reminders.map(reminder => 
          reminder.id === editingReminder.id ? updatedReminder : reminder
        )

        setReminders(updatedReminders)
        setFilteredReminders(updatedReminders)
        setIsEditModalOpen(false)
        setEditingReminder(null)
      } else {
        alert("Failed to update reminder")
      }
    } catch (error) {
      console.error("Error updating reminder:", error)
      alert("Error updating reminder")
    }
  }

  const handleMarkAsDone = async (id: string) => {
    try {
      const response = await remindersApi.updateStatus(id, "done")

      if (response.success) {
        const updatedReminders = reminders.map(reminder => 
          reminder.id === id ? { ...reminder, status: "done" } : reminder
        )

        setReminders(updatedReminders)
        setFilteredReminders(updatedReminders)
        stopAlarm()
      } else {
        alert("Failed to mark reminder as done")
        stopAlarm()
      }
    } catch (error) {
      console.error("Error marking reminder as done:", error)
      alert("Error marking reminder as done")
      stopAlarm()
    }
  }

  const handleSnooze = async (id: string, minutes: number) => {
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000)
    
    try {
      const token = getAuthToken()
      if (!token) {
        alert("Authentication required")
        stopAlarm()
        return
      }

      // Note: In a real implementation, we would need a specific API endpoint for snoozing
      // For now, we'll update the reminder with snooze information
      const updatedReminders: Reminder[] = reminders.map(reminder => 
        reminder.id === id 
          ? { 
              ...reminder, 
              status: "snoozed" as const,
              snoozeUntil: snoozeUntil.toISOString()
            } 
          : reminder
      )

      setReminders(updatedReminders)
      setFilteredReminders(updatedReminders)
      stopAlarm()
    } catch (error) {
      console.error("Error snoozing reminder:", error)
      alert("Error snoozing reminder")
      stopAlarm()
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="mr-1 h-3 w-3" /> Pending
        </span>
      case "snoozed":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <AlarmClock className="mr-1 h-3 w-3" /> Snoozed
        </span>
      case "done":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="mr-1 h-3 w-3" /> Done
        </span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
    }
  }

  return (
    <div className="space-y-6">
      {/* Hidden audio element for alarm sound */}
      <audio ref={audioRef}>
        <source src="/2.mp3" type="audio/mpeg" />
      </audio>

      {/* Enhanced Header with Visual Hierarchy */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Bell className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">Reminder Manager</h1>
                <p className="text-muted-foreground lg:text-lg text-base">Manage your scheduled tasks and notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                {filteredReminders.length} Reminders
              </Badge>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg lg:h-12 h-11 lg:px-6 px-4 w-full lg:w-auto">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    <span className="font-semibold">New Reminder</span>
                  </Button>
                </DialogTrigger>
              </Dialog>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Task Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock4 className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Productivity Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Section */}
      <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-r from-orange-50/50 to-white">
        <CardContent className="lg:p-6 p-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
            <div className="relative flex-1 lg:max-w-lg">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search reminders by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 lg:h-12 h-11 border-2 focus:border-orange-400 rounded-lg bg-white"
              />
            </div>
            
            {/* Enhanced Quick Stats */}
            <div className="flex items-center gap-3 lg:gap-6 overflow-x-auto">
              <div className="text-center lg:p-3 p-2 bg-orange-50 rounded-lg border border-orange-200 min-w-0 flex-shrink-0">
                <p className="lg:text-xl text-lg font-bold text-orange-600">{reminders.filter(r => r.status === 'pending').length}</p>
                <p className="lg:text-xs text-xs text-muted-foreground font-medium whitespace-nowrap">Pending</p>
              </div>
              <div className="text-center lg:p-3 p-2 bg-amber-50 rounded-lg border border-amber-200 min-w-0 flex-shrink-0">
                <p className="lg:text-xl text-lg font-bold text-amber-600">{reminders.filter(r => r.status === 'snoozed').length}</p>
                <p className="lg:text-xs text-xs text-muted-foreground font-medium whitespace-nowrap">Snoozed</p>
              </div>
              <div className="text-center lg:p-3 p-2 bg-green-50 rounded-lg border border-green-200 min-w-0 flex-shrink-0">
                <p className="lg:text-xl text-lg font-bold text-green-600">{reminders.filter(r => r.status === 'done').length}</p>
                <p className="lg:text-xs text-xs text-muted-foreground font-medium whitespace-nowrap">Completed</p>
              </div>
            </div>
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reminders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="snoozed">Snoozed</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Reminder Cards */}
      <div className="grid gap-4 lg:gap-6">
        {filteredReminders.map((reminder) => (
          <Card key={reminder.id} className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-orange-300 cursor-pointer bg-gradient-to-r from-white to-orange-50/30">
            <CardContent className="lg:p-6 p-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start lg:items-center gap-4 flex-1">
                  <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform border-2 border-orange-200 flex-shrink-0">
                    <Bell className="lg:h-8 lg:w-8 h-6 w-6 text-orange-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="lg:text-xl text-lg font-bold text-card-foreground group-hover:text-orange-600 transition-colors">
                        {reminder.title}
                      </h3>
                      {getStatusBadge(reminder.status)}
                    </div>
                    
                    {/* Enhanced Reminder Info */}
                    <div className="mb-3">
                      <p className="text-card-foreground text-sm lg:text-base mb-3">
                        {reminder.description}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-4 w-4 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-muted-foreground text-xs lg:text-sm">Scheduled Time</p>
                            <p className="text-card-foreground text-sm lg:text-base">
                              {format(new Date(reminder.scheduledTime), "MMM dd, yyyy HH:mm")}
                            </p>
                          </div>
                        </div>
                        
                        {reminder.repeat && reminder.repeat !== "none" && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Repeat className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-muted-foreground text-xs lg:text-sm">Repeats</p>
                              <p className="text-card-foreground text-sm lg:text-base capitalize">
                                {reminder.repeat}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 lg:ml-4 lg:flex-col lg:w-auto w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingReminder(reminder)
                      setIsEditModalOpen(true)
                    }}
                    className="bg-card hover:bg-orange-50 border-2 hover:border-orange-300 lg:h-10 h-9 lg:px-4 px-3 flex-1 lg:flex-none lg:w-full"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Enhanced Empty State */}
      {filteredReminders.length === 0 && (
        <Card className="border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50/30 to-white">
          <CardContent className="flex flex-col items-center justify-center lg:py-16 py-12">
            <div className="lg:w-20 lg:h-20 w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 border-2 border-orange-200">
              <Bell className="lg:h-10 lg:w-10 h-8 w-8 text-orange-500" />
            </div>
            <h3 className="lg:text-xl text-lg font-semibold text-muted-foreground mb-2">
              {searchTerm ? "No reminders found" : "No reminders yet"}
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-4 lg:text-base text-sm px-4">
              {searchTerm 
                ? "No reminders match your search criteria. Try adjusting your search terms."
                : "Start organizing your tasks by creating your first reminder."
              }
            </p>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Your First Reminder
                </Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Reminder Modal */}
      <Dialog open={isCreateModalOpen || isEditModalOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateModalOpen(false)
          setIsEditModalOpen(false)
          setEditingReminder(null)
          setNewReminder({ title: "", description: "", scheduledTime: "", repeat: "none" })
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingReminder ? "Edit Reminder" : "Create New Reminder"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={editingReminder ? editingReminder.title : newReminder.title}
                onChange={(e) => 
                  editingReminder 
                    ? setEditingReminder({...editingReminder, title: e.target.value})
                    : setNewReminder({...newReminder, title: e.target.value})
                }
                placeholder="Reminder title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editingReminder ? editingReminder.description : newReminder.description}
                onChange={(e) => 
                  editingReminder 
                    ? setEditingReminder({...editingReminder, description: e.target.value})
                    : setNewReminder({...newReminder, description: e.target.value})
                }
                placeholder="Reminder description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Scheduled Time</label>
              <Input
                type="datetime-local"
                value={
                  editingReminder 
                    ? editingReminder.scheduledTime.substring(0, 16)
                    : newReminder.scheduledTime
                }
                onChange={(e) => 
                  editingReminder 
                    ? setEditingReminder({...editingReminder, scheduledTime: e.target.value})
                    : setNewReminder({...newReminder, scheduledTime: e.target.value})
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium">Repeat</label>
              <select
                value={
                  editingReminder 
                    ? editingReminder.repeat || "none"
                    : newReminder.repeat
                }
                onChange={(e) => 
                  editingReminder 
                    ? setEditingReminder({...editingReminder, repeat: e.target.value as "none" | "daily" | "weekly" | "monthly"})
                    : setNewReminder({...newReminder, repeat: e.target.value as "none" | "daily" | "weekly" | "monthly"})
                }
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="none">None</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsCreateModalOpen(false)
                setIsEditModalOpen(false)
                setEditingReminder(null)
                setNewReminder({ title: "", description: "", scheduledTime: "", repeat: "none" })
              }}>
                Cancel
              </Button>
              <Button onClick={editingReminder ? handleEditReminder : handleCreateReminder}>
                {editingReminder ? "Save Changes" : "Create Reminder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Alarm Modal */}
      <Dialog open={isAlarmModalOpen} onOpenChange={(open) => {
        if (!open) stopAlarm()
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500 animate-pulse" />
              Reminder Alarm
            </DialogTitle>
          </DialogHeader>
          {alarmReminder && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h3 className="font-semibold text-lg">{alarmReminder.title}</h3>
                <p className="text-muted-foreground mt-1">{alarmReminder.description}</p>
                <div className="flex items-center mt-2 text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  {format(new Date(alarmReminder.scheduledTime), "MMM dd, yyyy HH:mm")}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => handleSnooze(alarmReminder.id, snoozeDuration)}
                >
                  <AlarmClock className="mr-2 h-4 w-4" />
                  Snooze {snoozeDuration} min
                </Button>
                <select 
                  value={snoozeDuration}
                  onChange={(e) => setSnoozeDuration(Number(e.target.value))}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="5">5 minutes</option>
                  <option value="10">10 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
                <Button 
                  onClick={() => handleMarkAsDone(alarmReminder.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Mark as Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}