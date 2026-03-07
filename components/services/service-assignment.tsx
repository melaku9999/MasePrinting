"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, DollarSign, FileText, Target, Users, CheckCircle2, Shield, ArrowLeft, Briefcase } from "lucide-react"
import type { ServiceAssignment } from "@/lib/services"
import type { Customer, Service } from "@/lib/auth"
import { mockCustomers, mockServices } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { customersApi, servicesApi, serviceAssignmentsApi } from "@/lib/api"
import { toast } from "sonner"

interface ServiceAssignmentProps {
  service?: Service
  assignment?: ServiceAssignment
  onSave: (assignment: Partial<ServiceAssignment>) => void
  onCancel: () => void
}

export function ServiceAssignmentForm({ service, assignment, onSave, onCancel }: ServiceAssignmentProps) {
  const [formData, setFormData] = useState({
    serviceId: service?.id || assignment?.serviceId || "",
    customerId: assignment?.customerId || "",
    status: assignment?.status || "active", // Default to active for immediate task creation
    notes: assignment?.notes || "",
    customPrice: assignment?.customPrice || service?.price || 0,
    due_date: (assignment as any)?.due_date || "",
  })
  const [lastPaid, setLastPaid] = useState<{ amount: string; date: string } | null>(null)
  const [fetchingLastPaid, setFetchingLastPaid] = useState(false)

  const [customers, setCustomers] = useState<Customer[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [customersRes, servicesRes] = await Promise.all([
          customersApi.getListMin(),
          servicesApi.getAll({ page_size: 100 })
        ])
        
        // Map backend customer_id to id for consistency with interface
        const mappedCustomers = (customersRes as any).map((c: any) => ({
          ...c,
          id: c.customer_id?.toString() || c.id?.toString()
        }))
        
        setCustomers(mappedCustomers)
        setServices((servicesRes as any).results || [])
        
        // If we have a passed service, ensure its price is used if customPrice is 0
        if (service && !assignment && formData.customPrice === 0) {
          setFormData(prev => ({ ...prev, customPrice: service.price }))
        }
      } catch (error) {
        console.error("Error fetching assignment data:", error)
        toast.error("Failed to load customer/service registry")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    const fetchLastPaid = async () => {
      if (formData.customerId && formData.serviceId) {
        setFetchingLastPaid(true)
        try {
          const res = await serviceAssignmentsApi.getLastPaid(formData.customerId, formData.serviceId)
          if (res.success && res.lastPaid) {
            setLastPaid(res.lastPaid)
            // Update customPrice to match last paid if it's a new assignment
            if (!assignment) {
              setFormData(prev => ({ ...prev, customPrice: parseFloat(res.lastPaid!.amount) }))
            }
          } else {
            setLastPaid(null)
          }
        } catch (error) {
          console.error("Error fetching last paid:", error)
        } finally {
          setFetchingLastPaid(false)
        }
      }
    }
    fetchLastPaid()
  }, [formData.customerId, formData.serviceId, assignment])

  const selectedService = services.find((s) => s.id === formData.serviceId) || service

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.customerId || !formData.serviceId) {
      toast.error("Please identify both customer and service")
      return
    }
    onSave({
      ...formData,
      assignedDate: assignment?.assignedDate || new Date().toISOString().split("T")[0],
    })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Target className="h-4 w-4 text-slate-900" />
                Assignment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Customer</label>
                    <Select value={formData.customerId} onValueChange={(value) => handleInputChange("customerId", value)}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                        <SelectValue placeholder={loading ? "Loading clients..." : "Identify client"} />
                      </SelectTrigger>
                      <SelectContent>
                        {loading ? (
                          <div className="p-2 text-xs text-center text-muted-foreground font-bold">Synchronizing...</div>
                        ) : (
                          customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id} className="font-bold">
                              {customer.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selected Service</label>
                    {service ? (
                      <div className="h-11 flex items-center px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-900">
                        <Building2 className="h-4 w-4 mr-2 text-slate-400" />
                        {service.name}
                      </div>
                    ) : (
                      <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
                        <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                          <SelectValue placeholder={loading ? "Loading catalog..." : "Choose portfolio item"} />
                        </SelectTrigger>
                        <SelectContent>
                          {loading ? (
                            <div className="p-2 text-xs text-center text-muted-foreground font-bold">Synchronizing...</div>
                          ) : (
                            services.map((s) => (
                              <SelectItem key={s.id} value={s.id} className="font-bold">
                                {s.name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sync Status</label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="font-bold text-orange-600">Pending</SelectItem>
                        <SelectItem value="active" className="font-bold text-emerald-600">Active</SelectItem>
                        <SelectItem value="inactive" className="font-bold text-slate-400">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline (Operational Limit)</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => handleInputChange("due_date", e.target.value)}
                      className="h-11 rounded-xl border-slate-200 font-bold"
                    />
                    <p className="text-[10px] text-slate-400 font-medium italic">Defaults to 7 days if unassigned.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Negotiated Rate ($)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.customPrice}
                        onChange={(e) => handleInputChange("customPrice", parseFloat(e.target.value) || 0)}
                        className="h-11 rounded-xl border-slate-200 pl-9 font-extrabold text-lg"
                      />
                    </div>
                    {lastPaid && (
                      <div className="flex items-center gap-1.5 px-1 pt-1 animate-in fade-in duration-300">
                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                        <p className="text-[10px] font-bold text-blue-600">
                          Last Paid: <span className="text-slate-900">${lastPaid.amount}</span> on {new Date(lastPaid.date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Integration Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    placeholder="Document specific client requirements or assignment caveats..."
                    rows={4}
                    className="rounded-xl border-slate-200 resize-none text-sm font-medium"
                  />
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200 shadow-xl rounded-2xl p-6 space-y-6 sticky top-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Review & Commit</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-900 border border-slate-100">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Manifest</p>
                  <p className="text-xs font-bold truncate">{selectedService?.name || "Service Unspecified"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-900 border border-slate-100">
                  <Users className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Integrator</p>
                  <p className="text-xs font-bold truncate">
                    {customers.find(c => c.id === formData.customerId)?.name || "Client Undefined"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <Button 
                onClick={handleSubmit} 
                className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg active:scale-95"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Finalize Assignment
              </Button>
              <Button variant="ghost" onClick={onCancel} className="w-full h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
                Abandon Config
              </Button>
            </div>
          </Card>

          {selectedService && (
            <Card className="bg-slate-50 border-none rounded-2xl p-5">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Catalog Specifications
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">{selectedService.description}</p>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                <span>Standard Price</span>
                <span className="text-slate-900">${selectedService.price}</span>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}