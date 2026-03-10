"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
  ArrowLeft, 
  Edit, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  Calendar,
  User,
  Settings,
  Activity,
  Building,
  UserCheck,
  Users,
  Target,
  Shield,
  FolderOpen,
  FileText,
  ImageIcon,
  Archive,
  Download,
  Eye,
  Upload,
  Building2
} from "lucide-react"
import type { Customer, BoxFile } from "@/lib/auth"
import { mockFiles } from "@/lib/auth"
import { getAuthToken } from "@/lib/auth"
import { customersApi } from "@/lib/api"
import { CustomerServices } from "./customer-services"

interface CustomerDetailsProps {
  customer: Customer
  onEdit: () => void
  onBack: () => void
  user?: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
  }
}

export function CustomerDetails({ customer, onEdit, onBack, user }: CustomerDetailsProps) {
  const isAdmin = user?.role === "admin"
  const [isMobile, setIsMobile] = useState(false)
  const [customerDetails, setCustomerDetails] = useState<Customer | null>(customer)
  const [loading, setLoading] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  // Log customer ID for debugging
  useEffect(() => {
    console.log("CustomerDetails component received customer with ID:", customer?.id)
  }, [customer])

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch detailed customer information from backend
  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        setLoading(true)
        // Fetch detailed customer information from your backend
        const response = await customersApi.getById(customer.id)
        console.log("Customer details response:", response)
        
        if (response) {
          // Transform backend data to match Customer interface
          const detailedCustomer: Customer = {
            id: response.id.toString(),
            name: response.name,
            email: response.email,
            phone: response.phone,
            address: response.address,
            status: response.status,
            balance: parseFloat(response.balance),
            createdAt: response.createdAt,
            prepaymentBalance: parseFloat(response.balance),
            paymentHistory: response.paymentHistory || [],
            boxFiles: response.boxFiles || [],
            username: response.username,
          }
          setCustomerDetails(detailedCustomer)
          console.log("Transformed customer details:", detailedCustomer)
        }
      } catch (error) {
        console.error("Error fetching customer details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (customer) {
      console.log("Initial customer data:", customer)
      fetchCustomerDetails()
    }
  }, [customer])

  // Get customer's files from mock data or backend
  const customerFiles = customerDetails?.boxFiles || mockFiles.filter((file) => file.customerId === customer.id)
  
  // Use customerDetails if available, otherwise fallback to customer
  const displayCustomer = customerDetails || customer
  
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.includes("image")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf")) return <FileText className="h-4 w-4" />
    if (type.includes("zip") || type.includes("archive")) return <Archive className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Notion-style Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <Button variant="ghost" onClick={onBack} className="text-slate-500 hover:text-slate-900 -ml-2 rounded-lg h-8 px-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Directory
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {displayCustomer.name}
            </h1>
            {displayCustomer.username && (
              <span className="text-xl font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                @{displayCustomer.username}
              </span>
            )}
            <Badge className={cn(
              "font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest",
              displayCustomer.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-500 hover:bg-slate-100"
            )}>
              {displayCustomer.status || 'Active'}
            </Badge>
          </div>
          <p className="text-slate-500 text-lg max-w-xl">
            Entity profile, commercial history, and documentation repository.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsPaymentModalOpen(true)} 
            className="h-11 border-slate-200 hover:bg-slate-50 text-slate-600 px-6 rounded-lg transition-colors font-bold"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Settle Balance
          </Button>
          <Button
            onClick={onEdit}
            className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-8 rounded-lg font-bold transition-all active:scale-95"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Detailed Information Grid */}
          <section className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Operational Context</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Communication Channel</p>
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors border border-slate-100">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">{displayCustomer.email}</p>
                    <p className="text-slate-400 text-xs font-medium">Primary Electronic Mail</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Direct Registry</p>
                <div className="flex items-center gap-3 group">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors border border-slate-100">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">{displayCustomer.phone}</p>
                    <p className="text-slate-400 text-xs font-medium">Registered Contact Number</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs font-black uppercase text-slate-500 tracking-wider">Entity Residence</p>
              <div className="flex items-start gap-3 group p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-slate-400 group-hover:text-slate-900 transition-colors shadow-sm shrink-0">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold leading-relaxed">{displayCustomer.address}</p>
                  <p className="text-slate-400 text-xs font-medium mt-1">Official Registered Business Address</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Workflows & Services</h3>
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <CustomerServices customerId={customer.id} />
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Repository</h3>
            <div className="grid gap-4">
              {customerFiles.length > 0 ? (
                customerFiles.map((file) => (
                  <div key={file.id} className="group flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-900 transition-all hover:shadow-md cursor-pointer">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-slate-100 transition-colors">
                      {getFileIcon(file.type || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 font-bold truncate">{file.name || file.label}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <span>{formatFileSize(file.size || 0)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span>{file.uploaded_at ? new Date(file.uploaded_at).toLocaleDateString() : 'Recent'}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <FolderOpen className="h-10 w-10 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 font-bold">No documentation found</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Workspace Context Sidebar */}
        <div className="space-y-10">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl space-y-8">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl font-black shadow-inner">
                {displayCustomer.name.charAt(0).toUpperCase()}
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-black leading-tight">{displayCustomer.name}</h4>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{displayCustomer.status} PARTNER</p>
              </div>
            </div>

            <Separator className="bg-slate-800" />

            <div className="space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Portfolio Balance</p>
                <p className="text-3xl font-black text-emerald-400">
                  ${(displayCustomer.prepaymentBalance || 0).toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Member Since</p>
                  <p className="text-xs font-bold">{new Date(displayCustomer.createdAt).getFullYear()}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Projects</p>
                  <p className="text-xs font-bold">Active</p>
                </div>
              </div>
            </div>

            <Button className="w-full h-12 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-black transition-all active:scale-95 shadow-lg">
              Generate Report
            </Button>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8">
            <h4 className="text-sm font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-3">
              <Activity className="h-4 w-4" /> Commercial Log
            </h4>
            
            <div className="space-y-6">
              {displayCustomer.paymentHistory && displayCustomer.paymentHistory.length > 0 ? (
                displayCustomer.paymentHistory.slice(0, 5).map((payment: any, index: number) => (
                  <div key={index} className="flex gap-4 group">
                    <div className="pt-1">
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        payment.type === 'charge' ? "bg-rose-500" : "bg-emerald-500"
                      )} />
                    </div>
                    <div>
                      <p className="text-slate-900 text-sm font-bold leading-none mb-1">
                        {payment.type === 'charge' ? '-' : '+'}${parseFloat(payment.amount).toLocaleString()}
                      </p>
                      <p className="text-slate-400 text-[10px] font-medium">
                        {new Date(payment.date).toLocaleDateString()} • {payment.notes || 'System Entry'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-slate-300 text-xs font-bold uppercase tracking-widest italic">No recent activity</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md shadow-2xl border border-slate-200">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <DollarSign className="h-5 w-5 text-slate-900" />
                Settle Commercial Balance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Transaction Amount ($)</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    type="number" 
                    className="pl-12 h-14 rounded-2xl text-xl font-black border-slate-100 focus:border-slate-900 focus:ring-slate-900/5 transition-all" 
                    placeholder="0.00"
                    id="payment-amount"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Registry Memo</label>
                <Input 
                  className="h-14 rounded-2xl border-slate-100 focus:border-slate-900 focus:ring-slate-900/5 transition-all font-bold" 
                  placeholder="e.g. Q1 Retainer Settlement"
                  id="payment-notes"
                />
              </div>
              <div className="pt-6 flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-2xl h-14 font-black border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-all"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-2xl h-14 font-black bg-slate-900 hover:bg-slate-800 text-white shadow-xl transition-all active:scale-95"
                  onClick={async () => {
                    const amountInput = document.getElementById('payment-amount') as HTMLInputElement
                    const notesInput = document.getElementById('payment-notes') as HTMLInputElement
                    const amount = amountInput?.value
                    const notes = notesInput?.value
                    
                    if (!amount || parseFloat(amount) <= 0) {
                      toast.error("Please enter a valid amount")
                      return
                    }
                    try {
                      setLoading(true)
                      await customersApi.addPayment(customer.id, {
                        amount: parseFloat(amount),
                        notes: notes,
                        type: 'payment'
                      })
                      toast.success("Payment recorded successfully")
                      setIsPaymentModalOpen(false)
                      // Refresh data
                      const response = await customersApi.getById(customer.id)
                      if (response) {
                        const detailedCustomer: Customer = {
                          id: response.id.toString(),
                          name: response.name,
                          email: response.email,
                          phone: response.phone,
                          address: response.address,
                          status: response.status,
                          balance: parseFloat(response.balance),
                          createdAt: response.createdAt,
                          prepaymentBalance: parseFloat(response.balance),
                          paymentHistory: response.paymentHistory || [],
                          boxFiles: response.boxFiles || [],
                        }
                        setCustomerDetails(detailedCustomer)
                      }
                    } catch (error) {
                      toast.error("Failed to record payment")
                    } finally {
                      setLoading(false)
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? "Registering..." : "Confirm Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
