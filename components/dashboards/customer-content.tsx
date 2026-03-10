"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { ProfileManagement } from "@/components/profile/profile-management"
import { BoxFileManagement } from "@/components/files/box-file-management"
import { CustomerChat } from "@/components/chat/customer-chat"
import { ServiceDetails } from "@/components/services/service-details"
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Briefcase,
  Layers,
  CheckCircle,
  FileText,
} from "lucide-react"
import { customersApi, servicesApi } from "@/lib/api"
import type { User as AuthUser } from "@/lib/auth"

interface CustomerContentProps {
  user: AuthUser
  activeTab: string
}

export function CustomerContent({ user, activeTab }: CustomerContentProps) {
  const [customer, setCustomer] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any | null>(null)
  const [showServiceDetails, setShowServiceDetails] = useState(false)

  const fetchCustomerData = async () => {
    if (!user.customer_id) return
    try {
      setLoading(true)
      const [customerData, servicesData, tasksData] = await Promise.all([
        customersApi.getById(user.customer_id.toString()),
        servicesApi.getCustomerServices(user.customer_id.toString()),
        servicesApi.getCustomerTasks(user.customer_id.toString())
      ])
      setCustomer(customerData)
      setServices(servicesData?.results || [])
      setTasks(tasksData?.results || [])
    } catch (error) {
      console.error("Failed to fetch customer data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomerData()
  }, [user.customer_id])

  const handleCloseServiceDetails = () => {
    setShowServiceDetails(false)
    setSelectedServiceForDetails(null)
  }

  const handleServiceClick = (service: any) => {
    setSelectedServiceForDetails(service)
    setShowServiceDetails(true)
  }

  const activeServices = services.filter(s => s.status === "active")
  const pendingTasks = tasks.filter(t => t.status === "pending" || t.status === "in-progress")
  const recentFiles = customer?.files?.slice(0, 5) || []

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {activeTab === "overview" && (
        <div className="max-w-[1400px] mx-auto space-y-6">
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Services</CardTitle>
                  <Briefcase className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeServices.length}</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-amber-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Status</CardTitle>
                  <Clock className="h-4 w-4 text-amber-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingTasks.length} Active</div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-emerald-500">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prepayment Balance</CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${(customer?.prepaymentBalance ?? 0).toFixed(2)}</div>
                </CardContent>
              </Card>
           </div>

           <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Subscribed Services</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeServices.map(service => (
                       <div 
                         key={service.id} 
                         className="p-3 bg-muted rounded-lg flex justify-between items-center cursor-pointer hover:bg-muted/80 transition-colors"
                         onClick={() => handleServiceClick(service)}
                       >
                         <span className="font-medium">{service.service_name}</span>
                         <Badge>{service.status}</Badge>
                       </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
           </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:border-primary transition-all overflow-hidden"
              onClick={() => handleServiceClick(service)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="secondary">{service.category || "General"}</Badge>
                  <Badge className={cn(
                    service.status === 'active' ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-blue-500/10 text-blue-600 border-blue-200"
                  )}>
                    {service.status.toUpperCase()}
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-xl">{service.service_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{service.description || "Active professional service subscription."}</p>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="text-sm font-bold text-primary">${service.price}</span>
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">View Portfolio</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          {tasks.map(task => (
             <Card key={task.id}>
               <CardContent className="p-6">
                 <div className="flex justify-between items-center">
                   <h3 className="text-lg font-bold">{task.title}</h3>
                   <Badge>{task.status}</Badge>
                 </div>
                 <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                 <Progress value={task.status === 'completed' ? 100 : 45} className="mt-4 h-2" />
               </CardContent>
             </Card>
          ))}
        </div>
      )}

      {activeTab === "files" && <BoxFileManagement />}
      {activeTab === "chat" && <CustomerChat />}
      {activeTab === "profile" && (
        <ProfileManagement 
          user={user} 
          onSave={() => {}} 
          showBackButton={false}
          inline={true}
        />
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
