"use client"

import { useState } from "react"
import { ServiceCatalog } from "./service-catalog"
import { LicenseManagement } from "./license-management"
import { ServiceAssignmentForm } from "./service-assignment"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Service } from "@/lib/auth"
import type { License, ServiceAssignment } from "@/lib/services"
import type { SubTask } from "@/lib/auth"
import { SubtaskEditor } from "@/components/tasks/subtask-editor"

type ViewMode = "catalog" | "licenses" | "assign" | "edit-service" | "edit-license" | "add-service"

export function ServiceManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("catalog")
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null)
  const [newService, setNewService] = useState<{
    name: string
    description: string
    category: string
    price: number
    requiresLicense: boolean
    subtasks: SubTask[]
  }>({
    name: "",
    description: "",
    category: "",
    price: 0,
    requiresLicense: false,
    subtasks: [],
  })

  const handleEditService = (service: Service) => {
    setSelectedService(service)
    setViewMode("edit-service")
  }

  const handleAssignService = (service: Service) => {
    setSelectedService(service)
    setViewMode("assign")
  }

  const handleEditLicense = (license: License) => {
    setSelectedLicense(license)
    setViewMode("edit-license")
  }

  const handleSaveAssignment = (assignment: Partial<ServiceAssignment>) => {
    console.log("[v0] Saving service assignment:", assignment)
    setViewMode("catalog")
  }

  const handleRenewLicense = (license: License) => {
    console.log("[v0] Renewing license:", license.licenseKey)
  }

  const handleAddService = () => {
    setNewService({
      name: "",
      description: "",
      category: "",
      price: 0,
      requiresLicense: false,
      subtasks: [],
    })
    setViewMode("add-service")
  }

  const handleSaveNewService = () => {
    console.log("[v0] Creating new service:", newService)
    // In a real app, this would save to database
    setViewMode("catalog")
    setNewService({
      name: "",
      description: "",
      category: "",
      price: 0,
      requiresLicense: false,
      subtasks: [],
    })
  }

  const handleCancel = () => {
    setSelectedService(null)
    setSelectedLicense(null)
    setNewService({
      name: "",
      description: "",
      category: "",
      price: 0,
      requiresLicense: false,
      subtasks: [],
    })
    setViewMode("catalog")
  }

  if (viewMode === "assign") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel} className="bg-transparent">
            Back to Services
          </Button>
          <h2 className="text-2xl font-bold text-card-foreground">Assign Service</h2>
        </div>
        <ServiceAssignmentForm service={selectedService!} onSave={handleSaveAssignment} onCancel={handleCancel} />
      </div>
    )
  }

  if (viewMode === "add-service") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel} className="bg-transparent">
            Back to Services
          </Button>
          <h2 className="text-2xl font-bold text-card-foreground">Add New Service</h2>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input
                placeholder="Enter service name"
                value={newService.name}
                onChange={(e) => setNewService((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter service description"
                value={newService.description}
                onChange={(e) => setNewService((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={newService.category}
                onValueChange={(value) => setNewService((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web-development">Web Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="hosting">Hosting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={newService.price}
                onChange={(e) => setNewService((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresLicense"
                checked={newService.requiresLicense}
                onCheckedChange={(checked) => setNewService((prev) => ({ ...prev, requiresLicense: !!checked }))}
              />
              <label htmlFor="requiresLicense" className="text-sm font-medium">
                Requires License
              </label>
            </div>

            <div className="space-y-2">
              <SubtaskEditor
                subtasks={newService.subtasks}
                onChange={subtasks => setNewService(prev => ({ ...prev, subtasks }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveNewService} disabled={!newService.name || !newService.category}>
                Create Service
              </Button>
              <Button variant="outline" onClick={handleCancel} className="bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (viewMode === "edit-service" && selectedService) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel} className="bg-transparent">
            Back to Services
          </Button>
          <h2 className="text-2xl font-bold text-card-foreground">Edit Service</h2>
        </div>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Edit Service Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Name</label>
              <Input
                placeholder="Enter service name"
                value={selectedService.name}
                onChange={e => setSelectedService(prev => prev ? { ...prev, name: e.target.value } : prev)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                placeholder="Enter service description"
                value={selectedService.description}
                onChange={e => setSelectedService(prev => prev ? { ...prev, description: e.target.value } : prev)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input
                placeholder="Category"
                value={selectedService.category}
                onChange={e => setSelectedService(prev => prev ? { ...prev, category: e.target.value } : prev)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Price ($)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={selectedService.price}
                onChange={e => setSelectedService(prev => prev ? { ...prev, price: Number.parseFloat(e.target.value) || 0 } : prev)}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresLicenseEdit"
                checked={selectedService.requiresLicense}
                onCheckedChange={checked => setSelectedService(prev => prev ? { ...prev, requiresLicense: !!checked } : prev)}
              />
              <label htmlFor="requiresLicenseEdit" className="text-sm font-medium">
                Requires License
              </label>
            </div>
            <div className="space-y-2">
              <SubtaskEditor
                subtasks={selectedService.subtasks || []}
                onChange={subtasks => setSelectedService(prev => prev ? { ...prev, subtasks } : prev)}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={() => setViewMode("catalog")}>Save Changes</Button>
              <Button variant="outline" onClick={handleCancel} className="bg-transparent">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-card-foreground">Service & License Management</h2>
      </div>

      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="licenses">Licenses</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-6">
          <ServiceCatalog
            onEditService={handleEditService}
            onAddService={handleAddService}
            onAssignService={handleAssignService}
          />
        </TabsContent>

        <TabsContent value="licenses" className="space-y-6">
          <LicenseManagement
            onEditLicense={handleEditLicense}
            onAddLicense={() => console.log("[v0] Add new license")}
            onRenewLicense={handleRenewLicense}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
