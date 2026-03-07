"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  FileText, 
  Users,
  Target,
  Shield,
  Clock,
  Zap,
  Activity,
  ChevronDown,
  Edit,
  Plus,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Service } from "@/lib/auth"
import { servicesApi } from "@/lib/api"
import { toast } from "sonner"

interface ServiceDetailsProps {
  service: Service
  onClose: () => void
  onEdit: (service: Service) => void
  onAssign: (service: Service) => void
}

export function ServiceDetails({ 
  service, 
  onClose,
  onEdit,
  onAssign
}: ServiceDetailsProps) {
  const [loading, setLoading] = useState(false)
  const [detailedService, setDetailedService] = useState<any>(null)

  useEffect(() => {
    const fetchFullDetails = async () => {
      try {
        setLoading(true)
        const response = await servicesApi.getById(service.id)
        if (response) {
          setDetailedService(response)
        }
      } catch (err) {
        console.error("Failed to fetch full service details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchFullDetails()
  }, [service.id])

  const completedSubtasks = service.subtasks?.filter(st => st.completed).length || 0
  const totalSubtasks = service.subtasks?.length || 0
  const progressPercentage = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose} 
          className="w-fit h-8 px-2 text-xs text-muted-foreground hover:text-foreground -ml-1"
        >
          <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
          Back to Registry
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex gap-5">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl flex-shrink-0 border border-slate-800">
              <Building2 className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[10px] uppercase tracking-widest">
                  {service.category}
                </Badge>
                {service.requiresLicense && (
                  <Badge className="bg-blue-50 text-blue-600 border-blue-100 font-bold text-[10px] uppercase tracking-widest">
                    <Shield className="h-3 w-3 mr-1" />
                    License Required
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">
                {service.name}
              </h1>
              <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                {service.description || "Comprehensive service offering optimized for business efficiency and strategic compliance."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => onEdit(service)}
              className="h-10 rounded-xl border-slate-200 px-5 font-bold text-xs"
            >
              <Edit className="h-3.5 w-3.5 mr-2" />
              Modify Service
            </Button>
            <Button 
              onClick={() => onAssign(service)}
              className="h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 shadow-lg shadow-slate-200 font-bold text-xs transition-all active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 mr-2" />
              Assign to Client
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="portfolio" className="space-y-6">
        <TabsList className="bg-transparent h-auto p-0 border-b border-slate-100 w-full justify-start rounded-none space-x-8">
          <TabsTrigger 
            value="portfolio" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 pb-4 h-auto text-xs font-black uppercase tracking-widest transition-none shadow-none text-slate-400 data-[state=active]:text-slate-900"
          >
            Portfolio
          </TabsTrigger>
          <TabsTrigger 
            value="workflow" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 pb-4 h-auto text-xs font-black uppercase tracking-widest transition-none shadow-none text-slate-400 data-[state=active]:text-slate-900"
          >
            Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="registry" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-0 pb-4 h-auto text-xs font-black uppercase tracking-widest transition-none shadow-none text-slate-400 data-[state=active]:text-slate-900"
          >
            Registry Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-900" />
                  Executive Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-600 leading-relaxed text-sm">
                  {service.description || "This service represents a core strategic offering within our catalog, designed to provide high-value results with streamlined operational processes."}
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                      <DollarSign className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Standard Pricing</p>
                      <p className="text-xl font-extrabold text-slate-900">${service.price.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
                      <Users className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Adoption</p>
                      <p className="text-xl font-extrabold text-slate-900">{detailedService?.subscribed_customers?.length || 0} Clients</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {service.requiredFields && service.requiredFields.length > 0 && (
              <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                <CardHeader className="bg-purple-50/30 border-b border-purple-100">
                  <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-purple-900">
                    <FileText className="h-4 w-4" />
                    Prerequisite Documentation
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {service.requiredFields.map((field, index) => (
                      <div key={index} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{field}</span>
                        <div className="ml-auto text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Required
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-tighter">Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-400">Workflow Fidelity</span>
                    <span className="text-slate-900">{progressPercentage}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-1.5 bg-slate-100" />
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Service Category</p>
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200 px-2">{service.category}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtasks Identified</p>
                    <span className="text-sm font-bold text-slate-900">{totalSubtasks} Items</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recurrence</p>
                    <span className="text-sm font-bold text-slate-900">{service.recurrence_days || 30} Days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 text-white border-none shadow-xl rounded-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-sm font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  Live Sync Status
                </h3>
                <div className="space-y-4 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-300">Catalog Registry Active</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="text-xs font-bold text-slate-300">Portfolio Data Linked</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="workflow" className="animate-in fade-in duration-500">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <Zap className="h-4 w-4 text-slate-900" />
                Operational Workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {service.subtasks && service.subtasks.length > 0 ? (
                <div className="space-y-4">
                  {service.subtasks.map((subtask, index) => (
                    <div key={subtask.id} className="relative pl-10">
                      {index < service.subtasks!.length - 1 && (
                        <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-slate-100" />
                      )}
                      
                      <div className="flex items-start gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-all shadow-sm">
                        <div className="absolute left-1 w-8 h-8 rounded-full border-2 border-slate-100 bg-white shadow-sm flex items-center justify-center flex-shrink-0 z-10 transition-colors group-hover:border-slate-300">
                          {subtask.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <span className="text-[10px] font-black text-slate-400">{index + 1}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <h4 className={cn(
                              "font-bold text-slate-900",
                              subtask.completed && "text-slate-400 line-through decoration-slate-300 decoration-2"
                            )}>
                              {subtask.title}
                            </h4>
                            {subtask.requiresProof && (
                              <Badge variant="outline" className="text-[9px] font-black border-blue-100 bg-blue-50 text-blue-600 px-1.5 uppercase tracking-tighter uppercase whitespace-nowrap">
                                <FileText className="h-2.5 w-2.5 mr-1" />
                                Proof Req.
                              </Badge>
                            )}
                          </div>
                          {subtask.description && (
                            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                              {subtask.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Clock className="h-5 w-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">No Workflow Identified</p>
                  <p className="text-xs text-slate-500 mt-2 max-w-xs mx-auto mb-6">This service does not have an active workflow defined in the registry.</p>
                  <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => onEdit(service)}>
                    Define Workflow
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registry" className="animate-in fade-in duration-500">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                <Settings className="h-4 w-4 text-slate-900" />
                Registry Manifest
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">System Identification</h4>
                    <div className="bg-slate-50 p-3 rounded-xl font-mono text-xs text-slate-600 border border-slate-100">
                      SERVICE_ID: {service.id}<br />
                      NAMESPACE: GLOBAL_REVENUE<br />
                      CLASS: ENTERPRISE_CORE
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Registry Flags</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-bold text-[10px] uppercase">STATUS: ACTIVE</Badge>
                      <Badge className="bg-blue-500/10 text-blue-600 border-none font-bold text-[10px] uppercase">SYNC: ENABLED</Badge>
                      <Badge className="bg-slate-900/10 text-slate-900 border-none font-bold text-[10px] uppercase">VER: 1.0.4</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Required Fields manifest</h4>
                    <ul className="space-y-2">
                      {(service.requiredFields || []).map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs font-bold text-slate-700">
                          <CheckCircle2 className="h-3.5 w-3.5 text-slate-300" />
                          {f}
                        </li>
                      ))}
                      {(service.requiredFields || []).length === 0 && <span className="text-xs text-slate-400 italic">None defined</span>}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}