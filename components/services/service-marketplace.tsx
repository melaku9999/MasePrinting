"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Search, 
  Briefcase, 
  User, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  History,
  TrendingUp,
  Tag,
  ArrowRight,
  Info,
  Target
} from "lucide-react"
import { servicesApi, customersApi, serviceAssignmentsApi, employeesApi } from "@/lib/api"
import { toast } from "sonner"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface ServiceMarketplaceProps {
  user: any
}

export function ServiceMarketplace({ user }: ServiceMarketplaceProps) {
  const [services, setServices] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Selection state
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<string>("")
  const [notes, setNotes] = useState("")
  const [lastPaid, setLastPaid] = useState<{ amount: string, date: string } | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isLoadingLastPaid, setIsLoadingLastPaid] = useState(false)
  const [employees, setEmployees] = useState<any[]>([])
  const [assignedToId, setAssignedToId] = useState<string>(user?.employee_id?.toString() || "")

  // Initialization
  useEffect(() => {
    fetchServices()
    fetchCustomers()
    fetchEmployees()
  }, [])

  const fetchServices = async () => {
    setIsLoading(true)
    try {
      const response = await servicesApi.getAll({ page_size: 100, status: "active" })
      setServices(response.results)
    } catch (error) {
      console.error("Failed to fetch services:", error)
      toast.error("Failed to load available services")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await customersApi.getListMin()
      setCustomers(response || [])
    } catch (error) {
      console.error("Failed to fetch customers:", error)
    }
  }

  const fetchEmployees = async () => {
    try {
      const response = await employeesApi.getAll({ page_size: 100 })
      setEmployees(response.results?.filter((e: any) => e.employee_id != null) || [])
    } catch (error) {
      console.error("Failed to fetch employees:", error)
    }
  }

  const handleServiceSelect = (service: any) => {
    setSelectedService(service)
    setCustomPrice(service.price.toString())
    setNotes("")
    setSelectedCustomerId("")
    setAssignedToId(user?.employee_id?.toString() || "")
    setLastPaid(null)
    setIsModalOpen(true)
  }

  const handleCustomerChange = async (customerId: string) => {
    setSelectedCustomerId(customerId)
    if (selectedService && customerId) {
      setIsLoadingLastPaid(true)
      try {
        const response = await serviceAssignmentsApi.getLastPaid(customerId, selectedService.id.toString())
        if (response.success && response.lastPaid) {
          setLastPaid(response.lastPaid)
          // Pre-fill with last paid price if available
          setCustomPrice(response.lastPaid.amount)
          toast.info(`Found historical price: $${response.lastPaid.amount}`)
        } else {
          setLastPaid(null)
          // Reset to service default price
          setCustomPrice(selectedService.price.toString())
        }
      } catch (error) {
        console.error("Failed to fetch last paid price:", error)
      } finally {
        setIsLoadingLastPaid(false)
      }
    }
  }

  const handleRecordService = async () => {
    if (!selectedCustomerId) {
      toast.error("Please select a customer")
      return
    }

    setIsRecording(true)
    try {
      const today = format(new Date(), "yyyy-MM-dd")
      
      await serviceAssignmentsApi.create({
        customerId: selectedCustomerId,
        serviceId: selectedService.id.toString(),
        customPrice: parseFloat(customPrice),
        notes: notes || "Recorded directly from employee portal",
        // @ts-ignore - Extra fields for our custom logic
        status: "active",
        assignedTo: assignedToId === "unassigned" ? undefined : assignedToId,
        due_date: today
      })
      
      toast.success("Job taken! A new task has been created for you.")
      setIsModalOpen(false)
      
      // Notify components to refresh tasks
      window.dispatchEvent(new CustomEvent('refreshTasks'))
    } catch (error: any) {
      console.error("Failed to record service:", error)
      toast.error(error.message || "Failed to record service")
    } finally {
      setIsRecording(false)
    }
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Service Marketplace</h2>
          <p className="text-muted-foreground">Browse available services and take jobs for customers.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search services..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse font-medium">Loading opportunities...</p>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="group overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1">
              <CardHeader className="bg-muted/30 group-hover:bg-primary/5 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className="font-bold tracking-tight">
                    {service.category || "General"}
                  </Badge>
                </div>
                <CardTitle className="mt-4 text-xl group-hover:text-primary transition-colors">{service.name}</CardTitle>
                <CardDescription className="line-clamp-2 min-h-[40px]">{service.description || "High-quality professional service for your customers."}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Standard Price</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                      ${service.price}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Delivery</p>
                    <Badge variant="outline" className="mt-1 font-bold">Today (Fast)</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  className="w-full h-11 rounded-xl font-bold gap-2 group/btn shadow-md hover:shadow-primary/20"
                  onClick={() => handleServiceSelect(service)}
                >
                  Take This Job
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-muted/20 rounded-3xl border-2 border-dashed">
          <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold">No services found</h3>
            <p className="text-muted-foreground">Try adjusting your search criteria or check back later.</p>
          </div>
        </div>
      )}

      {/* Record Service Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none shadow-2xl overflow-hidden rounded-3xl p-0">
          <div className="bg-gradient-to-br from-primary/10 via-background to-background p-6">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-2xl font-bold">Capture Service Job</DialogTitle>
                  <DialogDescription className="text-base font-medium">Assign {selectedService?.name} to a customer.</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Select Customer</Label>
                <Select value={selectedCustomerId} onValueChange={handleCustomerChange}>
                  <SelectTrigger className="h-12 border-none bg-white/80 backdrop-blur-sm shadow-inner rounded-2xl px-4">
                    <SelectValue placeholder="Which customer are you serving?" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-xl">
                    <ScrollArea className="h-[200px]">
                      {customers.map((c) => (
                        <SelectItem key={c.customer_id} value={c.customer_id.toString()} className="rounded-xl focus:bg-primary/10">
                          {c.name} ({c.email})
                        </SelectItem>
                      ))}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {selectedCustomerId && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Historical Pricing Card */}
                  <Card className={cn(
                    "border-none shadow-inner rounded-2xl overflow-hidden",
                    lastPaid ? "bg-indigo-50/50" : "bg-muted/30"
                  )}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shadow-sm",
                        lastPaid ? "bg-indigo-100 text-indigo-700" : "bg-muted text-muted-foreground"
                      )}>
                        {isLoadingLastPaid ? <Loader2 className="h-5 w-5 animate-spin" /> : <History className="h-5 w-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Historical Guidance</p>
                        {lastPaid ? (
                          <div className="flex items-baseline gap-2">
                            <span className="text-lg font-bold text-indigo-900">${lastPaid.amount}</span>
                            <span className="text-[10px] text-indigo-600/70 font-bold uppercase truncate">
                              Charged on {format(new Date(lastPaid.date), "MMM d, yyyy")}
                            </span>
                          </div>
                        ) : (
                          <p className="text-sm font-bold text-muted-foreground/70">No previous records found</p>
                        )}
                      </div>
                      {lastPaid && (
                        <Badge className="bg-indigo-600 text-[10px] font-bold uppercase py-0.5">Negotiated</Badge>
                      )}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Assign To</Label>
                    <Select value={assignedToId} onValueChange={setAssignedToId}>
                      <SelectTrigger className="h-12 border-none bg-white/80 backdrop-blur-sm shadow-inner rounded-2xl px-4">
                        <SelectValue placeholder="Assign to an employee" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-xl">
                        <ScrollArea className="h-[200px]">
                          <SelectItem value="unassigned" className="rounded-xl focus:bg-primary/10">
                            Unassigned (Any employee can claim)
                          </SelectItem>
                          {employees.map((e) => (
                            <SelectItem key={e.employee_id} value={String(e.employee_id)} className="rounded-xl focus:bg-primary/10">
                              {e.first_name} {e.last_name} {String(e.employee_id) === user?.employee_id?.toString() && "(You)"}
                            </SelectItem>
                          ))}
                        </ScrollArea>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Final Price ($)</Label>
                      <div className="relative group">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 bg-muted rounded-lg group-focus-within:bg-primary group-focus-within:text-white transition-all">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <Input 
                          type="number" 
                          value={customPrice}
                          onChange={(e) => setCustomPrice(e.target.value)}
                          className="h-12 pl-12 border-none bg-white/80 backdrop-blur-sm shadow-inner rounded-2xl font-bold text-lg" 
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Target Deadline</Label>
                      <div className="h-12 flex items-center px-4 bg-muted/50 rounded-2xl border-none">
                        <Calendar className="h-4 w-4 mr-3 text-primary" />
                        <span className="font-bold">Today (Same Day)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Optional Job Notes</Label>
                    <textarea 
                      placeholder="Special instructions or customer demands..."
                      className="w-full min-h-[100px] bg-white/80 backdrop-blur-sm shadow-inner border-none rounded-2xl p-4 text-sm focus:ring-2 ring-primary/20 transition-all outline-none resize-none"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-primary/80 font-medium leading-relaxed">
                  Recording this service will automatically create an active task {assignedToId === "unassigned" ? "that can be claimed by any employee" : `assigned to ${assignedToId === user?.employee_id?.toString() ? "you" : "the selected employee"}`} with a deadline set for end-of-day.
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4 gap-3 sm:gap-0">
              <Button 
                variant="ghost" 
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl font-bold"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleRecordService}
                disabled={isRecording || !selectedCustomerId}
                className="h-12 px-8 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
              >
                {isRecording ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                ESTABLISH JOB & TASK
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
