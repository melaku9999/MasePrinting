"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  Edit,
  Eye,
  Users,
  Building2,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  MoreVertical,
  Target,
  TrendingUp,
  CreditCard,
  Briefcase,
  Calendar
} from "lucide-react"
import { type Customer, getCurrentUser, getAuthToken } from "@/lib/auth"
import { customersApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface CustomerListProps {
  onViewCustomer: (customer: Customer) => void
  onEditCustomer: (customer: Customer) => void
  onAddCustomer: () => void
  onDeleteCustomer?: (customerId: string) => void
}

export function CustomerList({ onViewCustomer, onEditCustomer, onAddCustomer, onDeleteCustomer }: CustomerListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [hasPrevious, setHasPrevious] = useState(false)

  // Fetch customers from API
  const fetchCustomers = async (page: number = 1, search: string = searchTerm) => {
    try {
      setLoading(true)
      console.log("Fetching customers from backend...", { page, search })

      // Updated to match your backend response format and fix the arguments
      const response = await customersApi.getAll({ page, page_size: 20, search })
      console.log("Backend response:", response)

      // Handle different possible response structures
      let customersData = []
      let paginationInfo: {
        count: number
        next: string | null
        previous: string | null
        totalPages: number
      } = {
        count: 0,
        next: null,
        previous: null,
        totalPages: 1
      }

      if (response && response.results) {
        customersData = response.results
        paginationInfo = {
          count: response.count || customersData.length,
          next: response.next,
          previous: response.previous,
          totalPages: Math.ceil((response.count || customersData.length) / 20)
        }
      } else if (response && (response as any).customers) {
        customersData = (response as any).customers
        paginationInfo = {
          count: (response as any).count || customersData.length,
          next: (response as any).next,
          previous: (response as any).previous,
          totalPages: Math.ceil(((response as any).count || customersData.length) / 20)
        }
      } else if (Array.isArray(response)) {
        customersData = response
        paginationInfo = {
          count: response.length,
          next: null,
          previous: null,
          totalPages: 1
        }
      }

      if (customersData) {
        // Transform backend data to match Customer interface
        const transformedCustomers: Customer[] = customersData.map((customer: any) => ({
          id: customer.id.toString(),
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          status: customer.status,
          balance: parseFloat(customer.balance || 0),
          prepaymentBalance: parseFloat(customer.balance || 0),
          createdAt: customer.createdAt,
        }))
        setCustomers(transformedCustomers)
        setError(null)

        // Update pagination state
        setTotalCount(paginationInfo.count)
        setTotalPages(paginationInfo.totalPages)
        setHasNext(!!paginationInfo.next)
        setHasPrevious(!!paginationInfo.previous)
        setCurrentPage(page)
      } else {
        setError("Failed to fetch customers - no data received")
      }
    } catch (err) {
      setError("Error fetching customers: " + err)
      console.error("Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchCustomers(1, "")
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(1, searchTerm)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchTerm])

  // We no longer filter locally, results now come from backend search
  const filteredCustomers = customers

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Accounts", value: totalCount, icon: Users, color: "bg-blue-50 text-blue-600", border: "border-blue-100" },
          { label: "Active Partners", value: customers.filter(c => c.status === 'active').length, icon: Target, color: "bg-emerald-50 text-emerald-600", border: "border-emerald-100" },
          { label: "Portfolio Value", value: `$${customers.reduce((sum, c) => sum + (c.prepaymentBalance || 0), 0).toLocaleString()}`, icon: TrendingUp, color: "bg-amber-50 text-amber-600", border: "border-amber-100" },
          { label: "New Leads (MTD)", value: "12", icon: Briefcase, color: "bg-purple-50 text-purple-600", border: "border-purple-100" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-sm", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refined Control Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search by entity name, email, or identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
          <Button 
            onClick={onAddCustomer}
            className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-6 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Register Entity</span>
          </Button>
        </div>
      </div>

      {/* Refined Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white overflow-hidden flex flex-col">
            <div className="h-1.5 w-full bg-slate-100 group-hover:bg-slate-200 transition-colors" />
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  <Badge className={cn(
                    "font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    customer.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600 hover:bg-slate-100"
                  )}>
                    {customer.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onViewCustomer(customer)} className="cursor-pointer">
                        <Eye className="h-4 w-4 mr-2" /> View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEditCustomer(customer)} className="cursor-pointer">
                        <Edit className="h-4 w-4 mr-2" /> Edit Details
                      </DropdownMenuItem>
                      {onDeleteCustomer && (
                        <DropdownMenuItem onClick={() => onDeleteCustomer(customer.id)} className="cursor-pointer text-rose-600 focus:text-rose-600">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Account
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                    {customer.name}
                  </h3>
                  <p className="text-slate-400 text-sm font-medium truncate">{customer.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance</p>
                    <p className="text-sm font-bold text-slate-900">${(customer.prepaymentBalance || 0).toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Relation</p>
                    <p className="text-sm font-bold text-emerald-600">Premium</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center text-slate-400 text-xs">
                  <Calendar className="h-3 w-3 mr-1.5" />
                  {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : "New Entity"}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onViewCustomer(customer)}
                  className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-50 group/btn"
                >
                  Details <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refined Pagination Controls */}
      {!loading && !error && customers.length > 0 && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100 mt-8">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Showing <span className="text-slate-900">{customers.length}</span> of <span className="text-slate-900">{totalCount}</span> Entities
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers(currentPage - 1)}
              disabled={!hasPrevious || loading}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev
            </Button>
            
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                if (pageNum > totalPages || pageNum < 1) return null
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === currentPage ? "default" : "ghost"}
                    size="sm"
                    onClick={() => fetchCustomers(pageNum)}
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
                )
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchCustomers(currentPage + 1)}
              disabled={!hasNext || loading}
              className="h-10 px-4 border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 rounded-xl font-bold text-xs transition-all disabled:opacity-50"
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Refined Empty State */}
      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 border-dashed">
          <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
            <Users className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">
            {searchTerm ? "No entities found" : "Directory is empty"}
          </h3>
          <p className="text-slate-500 text-center max-w-sm mb-8">
            {searchTerm
              ? "Your search didn't yield any results. Try a different search term or check for typos."
              : "Synchronize your customer relationships and start building your global portfolio."}
          </p>
          {!searchTerm && (
            <Button onClick={onAddCustomer} className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-8 rounded-lg font-bold">
              <Plus className="h-4 w-4 mr-2" />
              Register First Customer
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
