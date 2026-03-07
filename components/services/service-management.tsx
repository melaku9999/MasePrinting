"use client"

import { useState, useEffect } from "react"
import { ServiceCatalog } from "./service-catalog"
import { ServiceDetails } from "./service-details"
import { LicenseManagement } from "./license-management"
import { ServiceAssignmentForm } from "./service-assignment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  Building, 
  DollarSign, 
  FileText, 
  Save, 
  ArrowLeft, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Eye,
  Settings,
  Shield,
  Briefcase
} from "lucide-react"
import type { Service, SubTask } from "@/lib/auth"
import type { License, ServiceAssignment } from "@/lib/services"
import { SubtaskEditor } from "@/components/tasks/subtask-editor"
import { servicesApi, serviceAssignmentsApi } from "@/lib/api"
import { toast } from "sonner"

type ViewMode = "catalog" | "view-service" | "licenses" | "assign" | "edit-service" | "edit-license" | "add-service"

export function ServiceManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("catalog")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const [newService, setNewService] = useState<{
    name: string
    description: string
    category: string
    price: number
    recurrence_days: number
    requiresLicense: boolean
    requiredFields: string[]
    requires_document: boolean
    subtasks: SubTask[]
  }>({
    name: "",
    description: "",
    category: "",
    price: 0,
    recurrence_days: 30,
    requiresLicense: false,
    requiredFields: [],
    requires_document: false,
    subtasks: [],
  })

  // Handlers
  const handleViewService = (service: Service) => {
    setSelectedService(service)
    setViewMode("view-service")
  }

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setViewMode("edit-service")
  }

  const handleAssignService = (service: Service) => {
    setSelectedService(service)
    setViewMode("assign")
  }

  const handleAddService = () => {
    setNewService({
      name: "",
      description: "",
      category: "",
      price: 0,
      recurrence_days: 30,
      requiresLicense: false,
      requiredFields: [],
      requires_document: false,
      subtasks: [],
    })
    setViewMode("add-service")
  }

  const handleSaveNewService = async () => {
    try {
      const createData = {
        name: newService.name,
        description: newService.description,
        price: newService.price.toString(),
        status: "active",
        category: newService.category,
        required_fields: newService.requiredFields,
        requires_document: newService.requires_document,
        recurrence_days: newService.recurrence_days,
        subtasks: newService.subtasks.map(subtask => ({
          title: subtask.title,
          description: subtask.description,
          requires_proof: subtask.requiresProof || false
        }))
      }
      
      const response = await servicesApi.create(createData)
      if (response) {
        toast.success("Service successfully integrated into catalog")
        setViewMode("catalog")
      }
    } catch (error) {
      toast.error("Failed to synchronize new service")
      console.error(error)
    }
  }

  const handleSaveEdit = async (service: Service) => {
    try {
      const updateData = {
        name: service.name,
        description: service.description,
        price: service.price.toString(),
        category: service.category,
        required_fields: service.requiredFields,
        requires_document: service.requires_document,
        subtasks: service.subtasks?.map((t: any) => ({
          title: t.title,
          description: t.description,
          requires_proof: t.requiresProof || false
        }))
      }
      
      const response = await servicesApi.update(service.id, updateData)
      if (response) {
        toast.success("Service manifest updated")
        setViewMode("catalog")
        setSelectedService(null)
      }
    } catch (error) {
      toast.error("Manifest update failed")
      console.error(error)
    }
  }

  const handleSaveAssignment = async (assignment: Partial<ServiceAssignment>) => {
    try {
      const response = await serviceAssignmentsApi.create(assignment as any)
      if (response.success) {
        toast.success("Service assignment finalized")
        setViewMode("catalog")
      }
    } catch (error) {
      toast.error("Assignment synchronization failed")
      console.error(error)
    }
  }

  const handleCancel = () => {
    setSelectedService(null)
    setSelectedLicense(null)
    setViewMode("catalog")
  }

  // View Components
  if (viewMode === "view-service" && selectedService) {
    return (
      <ServiceDetails 
        service={selectedService} 
        onClose={handleCancel}
        onEdit={handleEditService}
        onAssign={handleAssignService}
      />
    )
  }

  if (viewMode === "assign" && selectedService) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="w-fit h-8 px-2 text-xs text-muted-foreground hover:text-foreground -ml-1">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Registry
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finalize Assignment</h1>
            <p className="text-sm text-slate-500 mt-1">Configure parameters for client-service integration.</p>
          </div>
        </div>
        <ServiceAssignmentForm service={selectedService} onSave={handleSaveAssignment} onCancel={handleCancel} />
      </div>
    )
  }

  if (viewMode === "add-service") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="w-fit h-8 px-2 text-xs text-muted-foreground hover:text-foreground -ml-1">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Registry
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Initiate Service Manifest</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-slate-900" />
                  Service Core
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identification Name</label>
                    <Input 
                      placeholder="e.g., Compliance Audit X1" 
                      value={newService.name}
                      onChange={e => setNewService(p => ({...p, name: e.target.value}))}
                      className="h-11 rounded-xl border-slate-200 focus:border-slate-900 transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Domain Category</label>
                    <Select value={newService.category} onValueChange={v => setNewService(p => ({...p, category: v}))}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                        <SelectValue placeholder="Domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Licensing", "Company Setup", "Tax & Audit", "Legal", "Other"].map(c => (
                          <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                  <Checkbox 
                    id="requires-document-add" 
                    checked={newService.requires_document}
                    onCheckedChange={(checked) => setNewService(p => ({...p, requires_document: !!checked}))}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="requires-document-add" className="text-sm font-bold text-slate-900 cursor-pointer">
                      Requires Document Submission
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Enforce document upload requirements for this service assignment.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Narrative</label>
                  <Textarea 
                    placeholder="Describe specific features and enterprise deliverables..."
                    value={newService.description}
                    onChange={e => setNewService(p => ({...p, description: e.target.value}))}
                    rows={4}
                    className="rounded-xl border-slate-200 resize-none text-sm font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-900" />
                  Workflow Designer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SubtaskEditor
                  subtasks={newService.subtasks}
                  onChange={subtasks => setNewService(prev => ({ ...prev, subtasks }))}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-xl rounded-2xl p-6 space-y-4 sticky top-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Integration Hub</h3>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Unit Price ($)</label>
                  <Input 
                    type="number" 
                    value={newService.price}
                    onChange={e => setNewService(p => ({...p, price: Number(e.target.value)}))}
                    className="h-11 rounded-xl border-slate-200 font-extrabold text-lg"
                  />
                </div>
                <Button 
                  onClick={handleSaveNewService} 
                  disabled={!newService.name || !newService.category}
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-lg active:scale-95"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Synchronize Manifest
                </Button>
                <Button variant="ghost" onClick={handleCancel} className="w-full h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
                  Abort Integration
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (viewMode === "edit-service" && selectedService) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col gap-3">
          <Button variant="ghost" size="sm" onClick={handleCancel} className="w-fit h-8 px-2 text-xs text-muted-foreground hover:text-foreground -ml-1">
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            Back to Registry
          </Button>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Modify Service Manifest</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-900" />
                  Manifest Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Identification Name</label>
                    <Input 
                      value={selectedService.name}
                      onChange={e => setSelectedService(p => p ? {...p, name: e.target.value} : null)}
                      className="h-11 rounded-xl border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Domain Category</label>
                    <Select value={selectedService.category} onValueChange={v => setSelectedService(p => p ? {...p, category: v} : null)}>
                      <SelectTrigger className="h-11 rounded-xl border-slate-200 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Licensing", "Company Setup", "Tax & Audit", "Legal", "Other"].map(c => (
                          <SelectItem key={c} value={c} className="font-bold">{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
                  <Checkbox 
                    id="requires-document-edit" 
                    checked={selectedService.requires_document}
                    onCheckedChange={(checked) => setSelectedService(p => p ? {...p, requires_document: !!checked} : null)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor="requires-document-edit" className="text-sm font-bold text-slate-900 cursor-pointer">
                      Requires Document Submission
                    </label>
                    <p className="text-[10px] text-slate-500 font-medium">
                      Enforce document upload requirements for this service assignment.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Operational Narrative</label>
                  <Textarea 
                    value={selectedService.description}
                    onChange={e => setSelectedService(p => p ? {...p, description: e.target.value} : null)}
                    rows={4}
                    className="rounded-xl border-slate-200 text-sm font-medium"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-900" />
                  Workflow Manifest
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <SubtaskEditor
                  subtasks={selectedService.subtasks || []}
                  onChange={subtasks => setSelectedService(prev => prev ? { ...prev, subtasks } : null)}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 shadow-xl rounded-2xl p-6 space-y-4 sticky top-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Manifest Sync</h3>
              <div className="space-y-6 pt-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price Manifest ($)</label>
                  <Input 
                    type="number" 
                    value={selectedService.price}
                    onChange={e => setSelectedService(p => p ? {...p, price: Number(e.target.value)} : null)}
                    className="h-11 rounded-xl border-slate-200 font-extrabold text-lg"
                  />
                </div>
                <Button 
                  onClick={() => handleSaveEdit(selectedService!)} 
                  className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Update Manifest
                </Button>
                <Button variant="ghost" onClick={handleCancel} className="w-full h-12 rounded-xl text-slate-500 font-bold hover:bg-slate-50">
                  Cancel Update
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900">Service Management</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Enterprise Service Catalog & Compliance Registry</p>
      </div>

      <Tabs defaultValue="services" className="space-y-8">


        <TabsContent value="services" className="animate-in fade-in duration-500">
          <ServiceCatalog
            onViewService={handleViewService}
            onEditService={handleEditService}
            onAddService={handleAddService}
            onAssignService={handleAssignService}
          />
        </TabsContent>

        <TabsContent value="licenses" className="animate-in fade-in duration-500">
          <LicenseManagement onEditLicense={() => {}} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
