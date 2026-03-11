"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Building, DollarSign, FileText, Calendar, CheckCircle2, AlertCircle, Users } from "lucide-react"
import { servicesApi } from "@/lib/api"
import type { Service } from "@/lib/auth"

interface CustomerServicesProps {
  customerId: string
  onServiceSubscribed?: () => void
}

export function CustomerServices({ customerId, onServiceSubscribed }: CustomerServicesProps) {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [subscribing, setSubscribing] = useState<Record<string, boolean>>({})

  // Log the customerId when component mounts
  useEffect(() => {
    console.log("=== CUSTOMER SERVICES COMPONENT MOUNTED ===")
    console.log("Received customerId prop:", customerId)
    console.log("Type of customerId:", typeof customerId)
    console.log("customerId length:", customerId?.length)
    console.log("=== END CUSTOMER SERVICES COMPONENT MOUNTED ===")
  }, [customerId])

  // Fetch all services from backend
  const fetchServices = async () => {
    try {
      setLoading(true)
      console.log("Fetching all services from backend...")
      
      // Fetch services from your backend
      const response = await servicesApi.getAll({ page_size: 100 })
      console.log("Services response:", response)
      
      if (response && response.results) {
        // Transform backend data to match Service interface
        const transformedServices: Service[] = response.results.map((service: any) => ({
          id: service.id.toString(),
          name: service.name,
          description: service.description,
          category: service.category,
          price: parseFloat(service.price || 0),
          requiresLicense: false, // Default value since not in backend response
          requiredFields: service.required_fields || [],
          subtasks: service.subtask_templates ? service.subtask_templates.map((subtask: any) => ({
            id: subtask.id.toString(),
            title: subtask.title,
            description: subtask.description,
            completed: false,
            requiresProof: subtask.requires_proof || false,
            assignedTo: "",
            additionalCost: null
          })) : [],
          subscribedCustomers: [],
          pendingCustomers: [],
          status: service.status,
          recurrence_days: service.recurrence_days,
          subtask_templates: service.subtask_templates,
          // Add backend fields for subscription status checking - using the new structure
          subscribed_customers: service.subscribed_customers || [],
          pending_customers: service.pending_customers || []
        }))
        setServices(transformedServices)
        setError(null)
        console.log("Transformed services:", transformedServices)
        // Log a sample service to see the structure
        if (transformedServices.length > 0) {
          console.log("Sample service structure:", transformedServices[0])
        }
      } else {
        setError("Failed to fetch services - no data received")
        console.log("No service data found in response:", response)
      }
    } catch (err) {
      setError("Error fetching services: " + err)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  // Function to subscribe customer to a service
  const subscribeToService = async (serviceId: string) => {
    try {
      setSubscribing(prev => ({ ...prev, [serviceId]: true }))
      
      // Log the actual values being sent
      console.log("=== SUBSCRIBE DEBUG INFO ===")
      console.log("Service ID:", serviceId)
      console.log("Customer ID (prop):", customerId)
      console.log("Type of Customer ID:", typeof customerId)
      console.log("Customer ID length:", customerId?.length)
      console.log("=== END DEBUG INFO ===")
      
      // Call the backend API to add customer to pending list
      const response = await servicesApi.addToPending(serviceId, customerId)
      console.log("Subscribe response:", response)
      
      // Show success message or update UI
      if (response && response.detail) {
        // Don't show alert, just refresh the services
        console.log(response.detail)
      } else {
        console.log("Customer added to pending list successfully")
      }
      
      // Refresh services to update UI
      await fetchServices()
      
      // Notify parent component if needed
      if (onServiceSubscribed) {
        onServiceSubscribed()
      }
    } catch (error: any) {
      console.error("Error subscribing to service:", error)
      // Show user-friendly error message
      const errorMessage = error.message || error.toString() || "Error subscribing to service"
      alert("Error: " + errorMessage)
    } finally {
      setSubscribing(prev => ({ ...prev, [serviceId]: false }))
    }
  }

  // Function to remove customer from pending list
  const removeFromPending = async (serviceId: string) => {
    try {
      setSubscribing(prev => ({ ...prev, [serviceId]: true }))
      
      // Log the actual values being sent
      console.log("=== REMOVE FROM PENDING DEBUG INFO ===")
      console.log("Service ID:", serviceId)
      console.log("Customer ID (prop):", customerId)
      console.log("Type of Customer ID:", typeof customerId)
      console.log("Customer ID length:", customerId?.length)
      console.log("=== END DEBUG INFO ===")
      
      // Call the backend API to remove customer from pending list
      const response = await servicesApi.removeFromPending(serviceId, customerId)
      console.log("Remove from pending response:", response)
      
      // Show success message or update UI
      if (response && response.detail) {
        // Don't show alert, just refresh the services
        console.log(response.detail)
      } else {
        console.log("Customer removed from pending list successfully")
      }
      
      // Refresh services to update UI
      await fetchServices()
    } catch (error: any) {
      console.error("Error removing from pending list:", error)
      // Show user-friendly error message
      const errorMessage = error.message || error.toString() || "Error removing from pending list"
      alert("Error: " + errorMessage)
    } finally {
      setSubscribing(prev => ({ ...prev, [serviceId]: false }))
    }
  }

  // Helper function to check if customer is subscribed to a service
  const isCustomerSubscribed = (service: Service) => {
    if (service.subscribed_customers) {
      // subscribed_customers is an array of objects with id and name properties
      // We need to check if the customer ID matches
      console.log(`Checking if customer ${customerId} is subscribed to service`, service.id)
      console.log("Subscribed customers:", service.subscribed_customers)
      const isSubscribed = service.subscribed_customers.some((customer: any) => {
        // Convert both to strings for comparison since customerId might be a string
        const match = customer.id.toString() === customerId.toString()
        console.log(`Comparing customer.id (${customer.id}) with customerId (${customerId}): ${match}`)
        return match
      })
      console.log("Is customer subscribed:", isSubscribed)
      return isSubscribed
    }
    return false
  }

  // Helper function to check if customer is in pending list for a service
  const isCustomerPending = (service: Service) => {
    if (service.pending_customers) {
      // pending_customers is an array of objects with id and name properties
      console.log(`Checking if customer ${customerId} is pending for service`, service.id)
      console.log("Pending customers:", service.pending_customers)
      const isPending = service.pending_customers.some((customer: any) => {
        // Convert both to strings for comparison since customerId might be a string
        const match = customer.id.toString() === customerId.toString()
        console.log(`Comparing pending customer.id (${customer.id}) with customerId (${customerId}): ${match}`)
        return match
      })
      console.log("Is customer pending:", isPending)
      return isPending
    }
    return false
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
        <div className="h-12 w-12 rounded-full border-4 border-slate-200 border-t-slate-900 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Catalog...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 rounded-3xl bg-rose-50 border border-rose-100 text-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-white border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
          <AlertCircle className="h-6 w-6 text-rose-500" />
        </div>
        <div className="space-y-1">
          <h4 className="text-rose-900 font-black">Registry Synchronization Fail</h4>
          <p className="text-rose-600 text-sm font-medium">{error}</p>
        </div>
        <Button onClick={fetchServices} variant="outline" className="h-10 border-rose-200 text-rose-600 hover:bg-rose-100 font-bold rounded-xl px-6">
          Retry Sync
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Service Catalog</h3>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search service parameters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 rounded-xl transition-all font-medium"
          />
        </div>
      </div>

      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredServices.map((service) => (
            <Card key={service.id} className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white overflow-hidden flex flex-col rounded-2xl">
              <div className="h-1 w-full bg-slate-100 group-hover:bg-slate-900 transition-colors" />
              <CardContent className="p-6 flex-1 flex flex-col space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                      {service.name}
                    </h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {service.category}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shrink-0">
                    <Building className="h-4 w-4" />
                  </div>
                </div>

                <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <span className="text-xl font-black text-slate-900">${service.price.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {service.requiredFields && service.requiredFields.length > 0 && (
                      <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-100 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        {service.requiredFields.length} Fields
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50">
                  {isCustomerSubscribed(service) ? (
                    <Button
                      disabled
                      className="w-full h-11 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl font-black cursor-default"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      ACTIVE SUBSCRIPTION
                    </Button>
                  ) : isCustomerPending(service) ? (
                    <Button
                      onClick={() => removeFromPending(service.id)}
                      disabled={subscribing[service.id]}
                      className="w-full h-11 bg-amber-50 text-amber-600 border border-amber-100 rounded-xl font-black hover:bg-amber-100 transition-colors"
                    >
                      {subscribing[service.id] ? (
                        <div className="h-4 w-4 rounded-full border-2 border-amber-600 border-t-transparent animate-spin mx-auto" />
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          PENDING APPROVAL
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => subscribeToService(service.id)}
                      disabled={subscribing[service.id]}
                      className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-lg rounded-xl font-black transition-all active:scale-95"
                    >
                      {subscribing[service.id] ? (
                        <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mx-auto" />
                      ) : (
                        <>
                          <Users className="h-4 w-4 mr-2" />
                          INITIATE SERVICE
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Building className="h-8 w-8 text-slate-300" />
          </div>
          <h4 className="text-lg font-black text-slate-900 mb-1">Catalog Entry Void</h4>
          <p className="text-slate-500 text-center max-w-sm mb-8 font-medium">
            No service parameters matched your query. Try a different architectural filter.
          </p>
          {searchTerm && (
            <Button 
              variant="ghost" 
              onClick={() => setSearchTerm("")}
              className="text-slate-900 font-bold hover:bg-slate-50 rounded-xl px-6"
            >
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  )
}