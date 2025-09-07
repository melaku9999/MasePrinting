"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Settings, DollarSign, ArrowLeft, User, CheckCircle2, AlertCircle, Building } from "lucide-react"
import { mockServices, mockCustomers, type Service } from "@/lib/auth"

interface ServiceCatalogProps {
  onEditService: (service: Service) => void
  onAddService: () => void
  onAssignService: (service: Service) => void
}

export function ServiceCatalog({ onEditService, onAddService, onAssignService }: ServiceCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<Service[]>(mockServices)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [editService, setEditService] = useState<Service | null>(null)

  // Find customers subscribed to a service
  const getSubscribedCustomers = (serviceId: string) => {
    return mockCustomers.filter((customer: any) =>
      customer.subscriptions && customer.subscriptions.includes(serviceId)
    )
  }

  // Find customers waiting for approval for a service
  const getPendingCustomers = (serviceId: string) => {
    return mockCustomers.filter((customer: any) =>
      customer.pendingSubscriptions && customer.pendingSubscriptions.includes(serviceId)
    )
  }

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEditServiceClick = (service: Service) => {
    setEditService(service)
  }

  const handleEditServiceSave = (updatedService: Service) => {
    setServices(services.map(s => s.id === updatedService.id ? updatedService : s))
    setEditService(null)
  }

  const handleEditServiceCancel = () => {
    setEditService(null)
  }

  return (
    <div className="space-y-6">
      {editService ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={handleEditServiceCancel} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Button>
            <h2 className="text-2xl font-bold text-card-foreground">Edit Service</h2>
            <Badge variant="outline" className="text-lg">{editService.category}</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">{editService.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    value={editService.name}
                    onChange={e => setEditService({ ...editService, name: e.target.value })}
                    placeholder="Service Name"
                  />
                  <Textarea
                    value={editService.description}
                    onChange={e => setEditService({ ...editService, description: e.target.value })}
                    placeholder="Service Description"
                  />
                  <Input
                    type="number"
                    value={editService.price}
                    onChange={e => setEditService({ ...editService, price: Number(e.target.value) })}
                    placeholder="Price"
                  />
                  <Input
                    value={editService.category}
                    onChange={e => setEditService({ ...editService, category: e.target.value })}
                    placeholder="Category"
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editService.requiresLicense}
                      onChange={e => setEditService({ ...editService, requiresLicense: e.target.checked })}
                    />
                    Requires License
                  </label>
                </CardContent>
              </Card>
              {/* Subtasks Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Subtasks ({editService.subtasks ? editService.subtasks.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editService.subtasks && editService.subtasks.length > 0 ? (
                    <div className="space-y-3">
                      {editService.subtasks.map((subtask, idx) => (
                        <div key={subtask.id} className="p-3 bg-muted rounded-lg">
                          <Input
                            value={subtask.title}
                            onChange={e => {
                              const updated = [...editService.subtasks]
                              updated[idx] = { ...subtask, title: e.target.value }
                              setEditService({ ...editService, subtasks: updated })
                            }}
                            placeholder="Subtask Title"
                          />
                          <label className="flex items-center gap-2 mt-2">
                            <input
                              type="checkbox"
                              checked={subtask.completed}
                              onChange={e => {
                                const updated = [...editService.subtasks]
                                updated[idx] = { ...subtask, completed: e.target.checked }
                                setEditService({ ...editService, subtasks: updated })
                              }}
                            />
                            Completed
                          </label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No subtasks for this service.</p>
                  )}
                </CardContent>
              </Card>
              <div className="flex gap-4 pt-4">
                <Button type="button" onClick={() => handleEditServiceSave(editService)} className="flex-1">
                  Save Changes
                </Button>
                <Button type="button" variant="outline" onClick={handleEditServiceCancel} className="flex-1 bg-transparent">
                  Cancel
                </Button>
              </div>
            </div>
            {/* Sidebar Stats (read-only) */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subscribers:</span>
                    <span className="font-medium">{editService.subscribedCustomers ? editService.subscribedCustomers.length : 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Approval:</span>
                    <span className="font-medium text-orange-600">{editService.pendingCustomers ? editService.pendingCustomers.length : 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : selectedService ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" size="sm" onClick={() => setSelectedService(null)} className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Services
            </Button>
            <h2 className="text-2xl font-bold text-card-foreground">Service Details</h2>
            <Badge variant="outline" className="text-lg">{selectedService.category}</Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Service Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{selectedService.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">${selectedService.price.toFixed(2)}</Badge>
                      {selectedService.requiresLicense && (
                        <Badge variant="secondary">Requires License</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedService.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Category</p>
                        <p className="text-sm text-muted-foreground">{selectedService.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Price</p>
                        <p className="text-sm text-muted-foreground">${selectedService.price.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Subscribed Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Subscribed Customers ({getSubscribedCustomers(selectedService.id).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {getSubscribedCustomers(selectedService.id).map((customer) => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    ))}
                    {getSubscribedCustomers(selectedService.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No customers subscribed to this service.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Pending Approval Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Waiting for Approval ({getPendingCustomers(selectedService.id).length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {getPendingCustomers(selectedService.id).map((customer) => (
                      <div key={customer.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 font-medium">{customer.name}</span>
                        <span className="text-xs text-muted-foreground">{customer.email}</span>
                      </div>
                    ))}
                    {getPendingCustomers(selectedService.id).length === 0 && (
                      <p className="text-center text-muted-foreground py-4">No customers waiting for approval.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Subtasks Section - NEWLY ADDED */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-blue-600" />
                    Subtasks ({selectedService.subtasks ? selectedService.subtasks.length : 0})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedService.subtasks && selectedService.subtasks.length > 0 ? (
                    <div className="space-y-3">
                      {selectedService.subtasks.map((subtask) => (
                        <div key={subtask.id} className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{subtask.title}</span>
                            <Badge variant={subtask.completed ? "success" : "secondary"}>
                              {subtask.completed ? "Completed" : "Pending"}
                            </Badge>
                          </div>
                          {subtask.requiresProof && (
                            <div className="text-xs text-muted-foreground mt-1">Requires Proof</div>
                          )}
                          {subtask.additionalCost && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Additional Cost: ${subtask.additionalCost.amount} ({subtask.additionalCost.comment})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">No subtasks for this service.</p>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Sidebar Stats */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Service Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subscribers:</span>
                    <span className="font-medium">{getSubscribedCustomers(selectedService.id).length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Pending Approval:</span>
                    <span className="font-medium text-orange-600">{getPendingCustomers(selectedService.id).length}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-card-foreground">Service Catalog</h2>
            <Button onClick={onAddService} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Service
            </Button>
          </div>

          <div className="flex items-center gap-8 my-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <Card key={service.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{service.name}</CardTitle>
                    <Badge variant="outline">{service.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold text-lg">${service.price.toFixed(2)}</span>
                  </div>
                  {service.requiresLicense && (
                    <Badge variant="secondary" className="w-fit">
                      Requires License
                    </Badge>
                  )}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditService(service)}
                      className="flex-1 bg-transparent"
                    >
                      Edit
                    </Button>
                    <Button size="sm" onClick={() => onAssignService(service)} className="flex-1">
                      Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => setSelectedService(service)}
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No services found matching your search.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
