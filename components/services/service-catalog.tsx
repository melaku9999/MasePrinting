"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Plus, 
  Edit, 
  Building, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  Clock,
  FileText,
  Eye,
  Trash2
} from "lucide-react"
import { type Service, type Customer, mockCustomers } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { servicesApi } from "@/lib/api"
import { toast } from "sonner"

interface ServiceCatalogProps {
  onViewService: (service: Service) => void
  onEditService: (service: Service) => void
  onAddService: () => void
  onAssignService: (service: Service) => void
}

export function ServiceCatalog({ onViewService, onEditService, onAddService, onAssignService }: ServiceCatalogProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Fetch services from API
  const fetchServices = async (page: number = 1) => {
    try {
      setLoading(true)
      const response = await servicesApi.getAll({ page, page_size: 12 })
      
      let servicesData: any[] = []
      let paginationInfo: { 
        count: number; 
        next: string | null; 
        previous: string | null; 
        totalPages: number 
      } = {
        count: 0,
        next: null,
        previous: null,
        totalPages: 1
      }
      
      if (response && response.results) {
        servicesData = response.results
        paginationInfo = {
          count: response.count || servicesData.length,
          next: response.next || null,
          previous: response.previous || null,
          totalPages: Math.ceil((response.count || servicesData.length) / 12)
        }
      } else if (Array.isArray(response)) {
        servicesData = response
        paginationInfo = {
          count: response.length,
          next: null,
          previous: null,
          totalPages: 1
        }
      }
      
      if (servicesData) {
        const transformedServices: Service[] = servicesData.map((service: any) => ({
          id: service.id.toString(),
          name: service.name,
          description: service.description,
          category: service.category,
          price: parseFloat(service.price || 0),
          requiresLicense: false,
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
          status: service.status,
          recurrence_days: service.recurrence_days,
        }))
        setServices(transformedServices)
        setError(null)
        setTotalCount(paginationInfo.count)
        setTotalPages(paginationInfo.totalPages)
        setHasNext(!!paginationInfo.next)
        setHasPrevious(!!paginationInfo.previous)
        setCurrentPage(page)
      }
    } catch (err) {
      setError("Error fetching services: " + err)
      toast.error("Failed to load services")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete the service catalog entry for "${name}"? This action cannot be undone.`)) {
      return
    }

    try {
      setLoading(true)
      await servicesApi.delete(id)
      toast.success(`Service "${name}" removed from registry`)
      fetchServices(currentPage)
    } catch (err) {
      console.error("Deletion failed:", err)
      toast.error("Failed to delete service")
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServices(1)
  }, [])

  const filteredServices = services.filter(
    (service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Refined Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search services by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={onAddService} 
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" /> New Service
          </Button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-4" />
          <p className="text-sm font-medium text-slate-500">Curating service portfolio...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-red-50/50 rounded-2xl border border-dashed border-red-200">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <p className="text-sm font-semibold text-slate-900 mb-1">Portfolio Sync Failed</p>
          <p className="text-xs text-slate-600 max-w-sm mb-6">{error}</p>
          <Button onClick={() => fetchServices(1)} variant="outline" className="rounded-xl border-slate-200 hover:bg-slate-50">
            Retry Connection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group relative flex flex-col bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Category Badge */}
              <div className="flex items-start justify-between mb-4">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors border-none font-semibold text-[10px] uppercase tracking-wider">
                  {service.category}
                </Badge>
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 shadow-sm border border-slate-100">
                  <Building className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Title and Price */}
              <div className="mb-3">
                <h3 className="font-bold text-slate-900 group-hover:text-slate-900 transition-colors leading-tight mb-1">
                  {service.name}
                </h3>
                <div className="flex items-baseline gap-1.5 pt-1">
                  <span className="text-xl font-black text-slate-900 leading-none">
                    ${service.price.toFixed(0)}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">base price</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-6 h-8">
                {service.description || "Professional service offering for enterprise compliance and business growth."}
              </p>

              {/* Preview Chips */}
              <div className="flex flex-wrap gap-2 mb-6">
                {service.subtasks && service.subtasks.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-50/50 rounded-lg text-[10px] font-bold text-blue-600 border border-blue-100/50">
                    <Clock className="h-2.5 w-2.5" />
                    {service.subtasks.length} STEPS
                  </div>
                )}
                {service.requiredFields && service.requiredFields.length > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-purple-50/50 rounded-lg text-[10px] font-bold text-purple-600 border border-purple-100/50">
                    <FileText className="h-2.5 w-2.5" />
                    {service.requiredFields.length} REQ.
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewService(service)}
                  className="flex-1 h-9 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all active:scale-95"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Review
                </Button>
                <div className="flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditService(service)}
                    className="h-9 w-9 rounded-xl border border-slate-100/50 hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-all active:scale-95"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(service.id, service.name)}
                    className="h-9 w-9 rounded-xl border border-slate-100/50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all active:scale-95"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={() => onAssignService(service)}
                    className="h-9 w-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refined Pagination Controls */}
      {!loading && !error && services.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mt-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing Page <span className="text-slate-900">{currentPage}</span> of <span className="text-slate-900">{totalPages}</span> • <span className="text-slate-900">{totalCount}</span> Solutions Identified
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchServices(currentPage - 1)}
              disabled={!hasPrevious || loading}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                  return (
                    <Button
                      key={pageNum}
                      variant={pageNum === currentPage ? "default" : "ghost"}
                      size="sm"
                      onClick={() => fetchServices(pageNum)}
                      disabled={loading}
                      className={cn(
                        "w-8 h-8 p-0 rounded-lg text-xs font-black transition-all",
                        pageNum === currentPage 
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-md" 
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchServices(currentPage + 1)}
              disabled={!hasNext || loading}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredServices.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <Search className="h-6 w-6 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-900 mb-2">Portfolio Empty</p>
          <p className="text-xs text-slate-500 max-w-xs mb-8">
            {searchTerm
              ? "No services matched your current search filters. Check parameters and retry."
              : "Synchronize your first service to begin managing your enterprise catalog."}
          </p>
          {searchTerm ? (
            <Button variant="outline" className="rounded-xl border-slate-200" onClick={() => setSearchTerm("")}>
              Clear Active Filters
            </Button>
          ) : (
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 px-6" onClick={onAddService}>
              <Plus className="h-4 w-4 mr-2" />
              Initiate First Service
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
