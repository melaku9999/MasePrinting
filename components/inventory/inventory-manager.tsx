"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Plus, 
  Package, 
  MoveRight, 
  Clock, 
  Boxes, 
  TrendingDown, 
  ArrowRightLeft,
  Truck,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  Search,
  Filter,
  Activity,
  BarChart3,
  Layers,
  Zap,
  Info,
  DollarSign,
  TrendingUp,
  Building,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import { inventoryApi, branchesApi } from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"

interface InventoryManagerProps {

  user?: {
    role: "admin" | "employee" | "customer"
    employee_id?: number
    branch_id?: number
  }
}

export function InventoryManager({ user }: InventoryManagerProps) {
  const isAdmin = user?.role === "admin"
  const [activeTab, setActiveTab] = useState("products")
  const [products, setProducts] = useState<any[]>([])
  const [batches, setBatches] = useState<any[]>([])
  const [transfers, setTransfers] = useState<any[]>([])
  const [requests, setRequests] = useState<any[]>([])
  const [lowStock, setLowStock] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockAlerts: 0,
    activeTransfers: 0,
    pendingRequests: 0
  })
  
  // Dialog states
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [productForm, setProductForm] = useState({ name: "", sku: "", base_price: "", low_stock_threshold: "10" })
  
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  const [batchForm, setBatchForm] = useState({ 
    product: "", 
    quantity: "", 
    cost_per_unit: "", 
    location_type: "warehouse", 
    branch: "" 
  })

  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false)
  const [editingRequestId, setEditingRequestId] = useState<number | null>(null)
  const [requestForm, setRequestForm] = useState({
    items: [{ product: "", quantity: 1 }],
    notes: "",
    branch: ""
  })

  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false)
  const [editingTransferId, setEditingTransferId] = useState<number | null>(null)
  const [transferForm, setTransferForm] = useState({
    from_branch: "",
    to_branch: "",
    items: [{ product: "", quantity: 1 }]
  })

  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [productBatches, setProductBatches] = useState<any[]>([])
  const [selectedProductIds, setSelectedProductIds] = useState<Set<number>>(new Set())

  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    try {
      setLoading(true)
      if (activeTab === "products") {
        const data = await inventoryApi.getProducts()
        setProducts(data)
      } else if (activeTab === "stock") {
        const [batchData, branchData] = await Promise.all([
          inventoryApi.getBatches(isAdmin ? {} : { branch: user?.branch_id }),
          branchesApi.getAll()
        ])
        setBatches(batchData)
        setBranches(branchData)
      } else if (activeTab === "transfers") {
        const [transferData, branchData] = await Promise.all([
          inventoryApi.getTransfers(),
          branchesApi.getAll()
        ])
        setTransfers(transferData)
        setBranches(branchData)
      } else if (activeTab === "requests") {
        const [requestData, prodData] = await Promise.all([
          inventoryApi.getStockRequests(isAdmin ? {} : { branch: user?.branch_id }),
          inventoryApi.getProducts()
        ])
        setRequests(requestData)
        setProducts(prodData)
      } else if (activeTab === "low_stock") {
        const lowData = await inventoryApi.getLowStockReport(isAdmin ? {} : { branch: user?.branch_id })
        setLowStock(lowData)
      }
    } catch (error) {
      console.error("Error fetching inventory data:", error)
      toast.error("Failed to load inventory data")
    } finally {
      setLoading(false)
      // Calculate global stats whenever data is refreshed
      calculateStats()
    }
  }

  const calculateStats = async () => {
    try {
      const [prodData, batchData, requestData, transferData] = await Promise.all([
        inventoryApi.getProducts(),
        inventoryApi.getBatches(isAdmin ? {} : { branch: user?.branch_id }),
        inventoryApi.getStockRequests(isAdmin ? {} : { branch: user?.branch_id }),
        inventoryApi.getTransfers()
      ])

      const lowStockCount = prodData.filter((p: any) => 
        (p.available_stock || 0) < (p.low_stock_threshold || 10)
      ).length

      const totalVal = batchData.reduce((acc: number, batch: any) => 
        acc + (parseFloat(batch.cost_per_unit || 0) * (batch.quantity || 0)), 0
      )

      setStats({
        totalProducts: prodData.length,
        totalValue: totalVal,
        lowStockAlerts: lowStockCount,
        activeTransfers: transferData.filter((t: any) => t.status === 'pending').length,
        pendingRequests: requestData.filter((r: any) => r.status === 'pending').length
      })
    } catch (e) {
      console.error("Error calculating stats:", e)
    }
  }

  const handleViewDetails = async (product: any) => {
    try {
      setSelectedProduct(product)
      const batches = await inventoryApi.getBatches({ product: product.id })
      setProductBatches(batches)
      setIsDetailsDialogOpen(true)
    } catch (error) {
      toast.error("Failed to load product details")
    }
  }

  const handleCreateProduct = async () => {
    try {
      await inventoryApi.createProduct(productForm)
      toast.success("Product created successfully")
      setIsProductDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to create product")
    }
  }

  const handleCreateBatch = async () => {
    try {
      if (!batchForm.product || !batchForm.quantity || !batchForm.cost_per_unit) {
        return toast.error("Please fill all required fields")
      }
      
      const payload = {
        product: parseInt(batchForm.product),
        quantity: parseInt(batchForm.quantity),
        cost_per_unit: parseFloat(batchForm.cost_per_unit),
        location_type: batchForm.location_type,
        branch: batchForm.location_type === 'branch' ? parseInt(batchForm.branch) : null
      }
      
      await inventoryApi.createBatch(payload)
      toast.success("Stock batch added successfully")
      setIsBatchDialogOpen(false)
      fetchData()
    } catch (error) {
      toast.error("Failed to add stock batch")
    }
  }

  const handleSaveRequest = async () => {
    try {
      if (requestForm.items.some(i => !i.product || i.quantity <= 0)) {
        return toast.error("Please select products and valid quantities")
      }
      
      const payload = {
        items_data: requestForm.items.map(i => ({ 
          product_id: parseInt(i.product), 
          quantity: parseInt(i.quantity.toString()) 
        })),
        notes: requestForm.notes,
        branch: isAdmin ? parseInt(requestForm.branch) : user?.branch_id
      }
      
      if (!payload.branch) {
        return toast.error("Please select a branch")
      }
      
      if (editingRequestId) {
        await inventoryApi.updateStockRequest(editingRequestId, payload)
        toast.success("Stock request updated")
      } else {
        await inventoryApi.createStockRequest(payload)
        toast.success("Stock request submitted to Admin")
      }
      
      setIsRequestDialogOpen(false)
      setEditingRequestId(null)
      setRequestForm({ items: [{ product: "", quantity: 1 }], notes: "", branch: "" })
      fetchData()
    } catch (error) {
      toast.error(editingRequestId ? "Failed to update request" : "Failed to submit request")
    }
  }

  const handleDeleteRequest = async (id: number) => {
    if (!confirm("Are you sure you want to delete this request?")) return
    try {
      await inventoryApi.deleteStockRequest(id)
      toast.success("Request deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete request")
    }
  }

  const handleSaveTransfer = async () => {
    try {
      if (!transferForm.to_branch || transferForm.items.some(i => !i.product || i.quantity <= 0)) {
        return toast.error("Please fill all required fields")
      }
      
      const payload = {
        from_branch: transferForm.from_branch ? parseInt(transferForm.from_branch) : null,
        to_branch: parseInt(transferForm.to_branch),
        items_data: transferForm.items.map(i => ({
          product_id: parseInt(i.product),
          quantity: parseInt(i.quantity.toString())
        })),
        status: 'pending'
      }
      
      if (editingTransferId) {
        await inventoryApi.updateTransfer(editingTransferId, payload)
        toast.success("Transfer updated")
      } else {
        await inventoryApi.createTransfer(payload)
        toast.success("Stock transfer initiated")
      }
      
      setIsTransferDialogOpen(false)
      setEditingTransferId(null)
      setTransferForm({ from_branch: "", to_branch: "", items: [{ product: "", quantity: 1 }] })
      fetchData()
    } catch (error) {
      toast.error(editingTransferId ? "Failed to update transfer" : "Failed to initiate transfer")
    }
  }

  const handleDeleteTransfer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this transfer?")) return
    try {
      await inventoryApi.deleteTransfer(id)
      toast.success("Transfer deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete transfer")
    }
  }

  const handleProcessRequest = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      await inventoryApi.processStockRequest(requestId, action)
      toast.success(`Request ${action === 'approve' ? 'approved' : 'rejected'}`)
      fetchData()
    } catch (error) {
      toast.error("Failed to process request")
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Inventory Registry</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{isAdmin ? "Global Supply Chain & Warehouse Governance" : "Branch Stock Manifest & Supply Fulfillment"}</p>
        </div>
      </div>

      {/* Strategic Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in slide-in-from-top-4 duration-700 delay-150">
        <Card className="bg-slate-900 border-slate-800 shadow-2xl overflow-hidden group border-b-4 border-b-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Asset Valuation</p>
                <h3 className="text-3xl font-black text-white tracking-tighter">${stats.totalValue.toLocaleString()}</h3>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <Activity className="h-3 w-3" />
                  <span className="text-[10px] font-black uppercase tracking-tight">Active Supply Chain</span>
                </div>
              </div>
              <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-slate-700 transition-colors">
                <DollarSign className="h-5 w-5 text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm group hover:border-rose-200 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical Shortages</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.lowStockAlerts}</h3>
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Requires Restock
                </p>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl group-hover:bg-rose-100 transition-colors">
                <TrendingDown className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm group hover:border-blue-200 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Transit Operations</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.activeTransfers}</h3>
                <p className="text-[10px] font-bold text-blue-500 uppercase tracking-tight flex items-center gap-1">
                  <Truck className="h-3 w-3" /> In-Fulfillment
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-100 shadow-sm group hover:border-amber-200 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Fulfilment</p>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{stats.pendingRequests}</h3>
                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Awaiting Action
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        {/* Unified Control Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 w-full md:w-auto p-1 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
            <TabsList className="bg-transparent p-0 h-9">
              <TabsTrigger value="products" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
                <Package className="h-3.5 w-3.5" /> Products
              </TabsTrigger>
              <TabsTrigger value="stock" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
                <Boxes className="h-3.5 w-3.5" /> {isAdmin ? "Global" : "Branch"}
              </TabsTrigger>
              <TabsTrigger value="requests" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
                <Truck className="h-3.5 w-3.5" /> Requests
              </TabsTrigger>
              <TabsTrigger value="transfers" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
                <ArrowRightLeft className="h-3.5 w-3.5" /> Transfers
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="low_stock" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
                  <AlertCircle className="h-3.5 w-3.5" /> Alerts
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="relative flex-1 group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input
              placeholder="Find items in manifest by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
              <Filter className="h-4 w-4 text-slate-400" />
            </Button>
            
            {activeTab === "products" && (
               <>
                 {!isAdmin && (
                    <Button variant="outline" onClick={() => setIsRequestDialogOpen(true)} className="h-11 px-6 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-xs uppercase tracking-widest gap-2">
                      <ShoppingCart className="h-3.5 w-3.5" /> Request Flow
                    </Button>
                 )}
                 {isAdmin && (
                    <Button onClick={() => setIsProductDialogOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest gap-2">
                      <Plus className="h-3.5 w-3.5" /> Register Asset
                    </Button>
                 )}
               </>
            )}
            {activeTab === "stock" && isAdmin && (
              <Button onClick={() => setIsBatchDialogOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest gap-2">
                <Plus className="h-3.5 w-3.5" /> Multi-Batch
              </Button>
            )}
            {activeTab === "transfers" && isAdmin && (
              <Button onClick={() => setIsTransferDialogOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95 text-xs uppercase tracking-widest gap-2">
                <Plus className="h-3.5 w-3.5" /> Manual Transfer
              </Button>
            )}
          </div>
        </div>

        <TabsContent value="products" className="space-y-4">

          <div className="flex justify-between items-center gap-2">
            <div>
               {selectedProductIds.size > 0 && (
                 <div className="flex items-center gap-2 p-2 bg-slate-900/5 backdrop-blur-sm border border-slate-200 rounded-xl animate-in zoom-in-95">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest ml-2">{selectedProductIds.size} Assets Selected</span>
                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900" onClick={() => setSelectedProductIds(new Set())}>Reset</Button>
                    <Separator orientation="vertical" className="h-4 bg-slate-200" />
                    <Button size="sm" className="h-7 text-[10px] font-black uppercase bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
                      Execute Bulk Transfer
                    </Button>
                 </div>
               )}
            </div>
          </div>
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[60px] px-6">
                      <Checkbox 
                        checked={selectedProductIds.size === filteredProducts.length && filteredProducts.length > 0} 
                        onCheckedChange={(checked) => {
                          if (checked) setSelectedProductIds(new Set(filteredProducts.map(p => p.id)))
                          else setSelectedProductIds(new Set())
                        }}
                        className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                      />
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Serial SKU</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Asset Identification</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Baseline Value</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Critical Min</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Manifest Qty</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Strategic Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">Calibrating supply manifest...</TableCell></TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">No assets identified in the specified domain.</TableCell></TableRow>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = selectedProductIds.has(p.id)
                      const isLowStock = (p.available_stock || 0) < (p.low_stock_threshold || 10)
                      return (
                        <TableRow key={p.id} className={cn("border-slate-50 group hover:bg-slate-50/50 transition-colors", isSelected && "bg-slate-50/80")}>
                          <TableCell className="px-6">
                            <Checkbox 
                              checked={isSelected} 
                              onCheckedChange={(checked) => {
                                const newSet = new Set(selectedProductIds)
                                if (checked) newSet.add(p.id)
                                else newSet.delete(p.id)
                                setSelectedProductIds(newSet)
                              }}
                              className="border-slate-300 data-[state=checked]:bg-slate-900 data-[state=checked]:border-slate-900"
                            />
                          </TableCell>
                          <TableCell className="px-6 font-mono text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            <div className="flex flex-col">
                              <span className="text-slate-900">#INV-{p.sku || p.id}</span>
                              <span className="text-[8px] text-slate-400">BATCH-V01</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                <Layers className="h-5 w-5 text-slate-400" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900 leading-tight">{p.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">SKU: {p.sku || 'N/A'}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 text-xs">${parseFloat(p.base_price || 0).toLocaleString()}</span>
                              <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tight flex items-center gap-1"><TrendingUp className="h-2 w-2" /> Market Stable</span>
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex flex-col gap-1">
                              <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] px-1.5 py-0 w-fit">
                                {p.low_stock_threshold || 10} LIMIT
                              </Badge>
                              <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-300 w-full" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <div className="flex flex-col gap-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className={cn(
                                  "font-black text-[11px] uppercase tracking-tighter",
                                  isLowStock ? "text-rose-600" : "text-emerald-700"
                                )}>
                                  {p.available_stock || 0}
                                </span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Health</span>
                              </div>
                              <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-1000",
                                    isLowStock ? "bg-rose-500" : "bg-emerald-500"
                                  )} 
                                  style={{ width: `${Math.min(((p.available_stock || 0) / ((p.low_stock_threshold || 10) * 2)) * 100, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                            <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all transform sm:translate-x-2 group-hover:translate-x-0">
                               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm" onClick={() => {setSelectedProduct(p); setIsDetailsDialogOpen(true)}}>Analyze</Button>
                               {!isAdmin && (
                                 <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 hover:bg-white rounded-lg border border-transparent hover:border-slate-100 shadow-none hover:shadow-sm" onClick={() => {
                                   setRequestForm({ 
                                     items: [{ product: p.id.toString(), quantity: 1 }],
                                     notes: "",
                                     branch: user?.branch_id?.toString() || ""
                                   })
                                   setIsRequestDialogOpen(true)
                                 }}>Reserve</Button>
                               )}
                               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 shadow-none hover:shadow-sm">Modify</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stock" className="space-y-6 pt-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6">Asset Identity</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6">Distribution Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6">Reserve Quantity</TableHead>
                    {isAdmin && (
                      <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6">Economic Valuation</TableHead>
                    )}
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6">Ingestion Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-12 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                        Scanning Distribution Hubs...
                      </TableCell>
                    </TableRow>
                  ) : batches.filter(b => b.quantity > 0).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest">
                        No Active Stock Mandates Found
                      </TableCell>
                    </TableRow>
                  ) : (
                    batches.filter(b => b.quantity > 0).map((b) => (
                      <TableRow key={b.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-black text-slate-900 leading-tight">{b.product_name}</span>
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">BATCH-#{b.id}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              "font-black text-[9px] px-2 py-0.5 uppercase tracking-tighter border-none",
                              b.location_type === 'warehouse' ? "bg-slate-900 text-white" : "bg-emerald-100 text-emerald-700"
                            )}>
                              {b.location_type === 'warehouse' ? 'Central Hub' : 'Branch Node'}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-1">
                              {b.location_type === 'warehouse' ? 'Warehouse One' : b.branch_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex flex-col gap-1.5 w-32">
                            <div className="flex justify-between items-center text-[10px] font-black">
                              <span className="text-slate-900">{b.quantity} Units</span>
                              <span className="text-slate-400">{Math.min(100, Math.round((b.quantity / 500) * 100))}% Capacity</span>
                            </div>
                            <Progress 
                              value={Math.min(100, (b.quantity / 500) * 100)} 
                              className={cn(
                                "h-1.5 bg-slate-100",
                                (b.quantity / 500) < 0.2 ? "[&>div]:bg-rose-500" : 
                                (b.quantity / 500) < 0.5 ? "[&>div]:bg-amber-500" : 
                                "[&>div]:bg-emerald-500"
                              )}
                            />
                          </div>
                        </TableCell>
                        {isAdmin && (
                          <TableCell className="px-6">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-900">${parseFloat(b.cost_per_unit).toFixed(2)} / unit</span>
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Total: ${(b.quantity * parseFloat(b.cost_per_unit)).toFixed(2)}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell className="px-6">
                           <div className="flex items-center gap-2 text-slate-500">
                             <Clock className="h-3.5 w-3.5" />
                             <span className="text-[10px] font-bold uppercase">{new Date(b.received_at).toLocaleDateString()}</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-6 text-right">
                          <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-900 hover:bg-slate-100 rounded-lg group/btn">
                            History <ArrowRight className="ml-1.5 h-3 w-3 group-hover/btn:translate-x-0.5 transition-transform" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Supply Chain Requests</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Request ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Source Branch</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Asset Count</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Workflow Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Date</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Fetching requests...</TableCell></TableRow>
                  ) : requests.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No requests found.</TableCell></TableRow>
                  ) : (
                    requests.map((r) => (
                      <TableRow key={r.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-6">
                           <div className="flex flex-col">
                              <span className="font-mono text-[10px] font-black text-slate-900">#REQ-{r.id.toString().padStart(4, '0')}</span>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">LOGISTICS-V3</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                            <span className="font-bold text-slate-900">{r.branch_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-1.5">
                            <Layers className="h-3 w-3 text-slate-400" />
                            <span className="text-xs font-black text-slate-900">{r.items_data?.length || 0} Assets Requested</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge variant={
                            r.status === 'approved' ? 'default' : 
                            r.status === 'pending' ? 'outline' : 
                            r.status === 'rejected' ? 'destructive' : 'secondary'
                          } className={cn(
                            "font-black text-[10px] uppercase tracking-tighter px-2 py-0.5 border-none",
                            r.status === 'approved' && "bg-emerald-100 text-emerald-700",
                            r.status === 'pending' && "bg-blue-50 text-blue-600 border-blue-100",
                            r.status === 'rejected' && "bg-rose-100 text-rose-700"
                          )}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(r.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="px-6 text-right">
                           <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                              {isAdmin && r.status === 'pending' ? (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50" onClick={() => handleProcessRequest(r.id, 'approve')}>Approve</Button>
                                  <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50" onClick={() => handleProcessRequest(r.id, 'reject')}>Reject</Button>
                                </>
                              ) : r.status === 'pending' ? (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900" onClick={() => {
                                    setEditingRequestId(r.id)
                                    setRequestForm({
                                       items: r.items_data.map((i: any) => ({ product: i.product_id.toString(), quantity: i.quantity })),
                                       notes: r.notes || "",
                                       branch: r.branch?.toString() || ""
                                    })
                                    setIsRequestDialogOpen(true)
                                  }}>Modify</Button>
                                  <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteRequest(r.id)}>Abort</Button>
                                </>
                              ) : (
                                <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400">View Logs</Button>
                              )}
                           </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers" className="space-y-4 pt-4">
          <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-lg">Fulfillment Transfers</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Transfer ID</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Origin Hub</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Destination Hub</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Logistics Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Timestamp</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={6} className="text-center">Tracking shipments...</TableCell></TableRow>
                  ) : transfers.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground">No transfers recorded.</TableCell></TableRow>
                  ) : (
                    transfers.map((t) => (
                      <TableRow key={t.id} className="group hover:bg-slate-50/50 transition-colors border-slate-50">
                        <TableCell className="px-6">
                           <div className="flex flex-col">
                              <span className="font-mono text-[10px] font-black text-slate-900">#TRN-{t.id.toString().padStart(4, '0')}</span>
                              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">FULFILLMENT-V2</span>
                           </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-emerald-500" />
                             <span className="font-bold text-slate-900">{t.from_branch_details?.name || 'Central Warehouse'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                           <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-blue-500" />
                             <span className="font-bold text-slate-900">{t.to_branch_details?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6">
                          <Badge variant={t.status === 'completed' ? 'default' : 'outline'} className={cn(
                             "font-black text-[10px] uppercase tracking-tighter px-2 py-0.5 border-none",
                             t.status === 'completed' ? "bg-emerald-100 text-emerald-700" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 text-[10px] font-bold text-slate-400 uppercase tracking-tight">{new Date(t.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="px-6 text-right">
                          <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                            {t.status === 'pending' && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50" onClick={async () => {
                                    try {
                                      await inventoryApi.completeTransfer(t.id)
                                      toast.success("Logistics Mission Success: Stock Merged")
                                      fetchData()
                                    } catch (e) {
                                      toast.error("Failed to complete move")
                                    }
                                }}>
                                   Complete Move
                                </Button>
                                {isAdmin && (
                                  <>
                                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900" onClick={() => {
                                        setEditingTransferId(t.id)
                                        setTransferForm({
                                          from_branch: t.from_branch?.toString() || "",
                                          to_branch: t.to_branch?.toString() || "",
                                          items: t.items_data.map((i: any) => ({ product: i.product_id.toString(), quantity: i.quantity }))
                                        })
                                        setIsTransferDialogOpen(true)
                                    }}>Modify</Button>
                                    <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-rose-500 hover:bg-rose-50" onClick={() => handleDeleteTransfer(t.id)}>Abort</Button>
                                  </>
                                )}
                              </>
                            )}
                            {t.status === 'completed' && (
                               <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase text-slate-400">View Audit</Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="low_stock" className="space-y-4">
            <Card className="border-rose-200">
              <CardHeader className="bg-rose-50 border-b border-rose-100">
                <CardTitle className="text-rose-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" /> Critical Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Product Asset</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Current Stock</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Warning Threshold</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Threat Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Tactical Action</TableHead>
                  </TableRow>
                </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={5} className="text-center italic">Scanning for shortages...</TableCell></TableRow>
                    ) : lowStock.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-8 text-emerald-600 font-medium">All stock levels are optimal.</TableCell></TableRow>
                    ) : (
                      lowStock.map((ls) => (
                        <TableRow key={ls.id} className="group hover:bg-rose-50/30 transition-colors border-slate-50">
                          <TableCell className="px-6">
                             <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-bold text-slate-900 leading-tight">{ls.name}</span>
                                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">BRANCH: {ls.branch_name || 'N/A'}</span>
                                </div>
                             </div>
                          </TableCell>
                          <TableCell className="px-6">
                             <div className="flex flex-col">
                                <span className="text-xl font-black text-rose-600">{ls.current_stock}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Reserve</span>
                             </div>
                          </TableCell>
                          <TableCell className="px-6">
                             <div className="flex flex-col">
                                <span className="text-sm font-black text-slate-900">{ls.threshold}</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">Alert Trigger</span>
                             </div>
                          </TableCell>
                          <TableCell className="px-6">
                            <Badge className="bg-rose-100 text-rose-700 font-black text-[10px] uppercase tracking-tighter border-none px-2 py-0.5">
                              Critical Threshold
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 text-right">
                             <div className="flex justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all">
                                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase text-rose-600 hover:bg-rose-50" onClick={() => {
                                   setTransferForm({
                                     from_branch: "",
                                     to_branch: ls.branch_id || "",
                                     items: [{ product: ls.id.toString(), quantity: ls.threshold || 10 }]
                                   })
                                   setIsTransferDialogOpen(true)
                                }}>
                                   Authorize Restock
                                </Button>
                             </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
        </TabsContent>
      )}
    </Tabs>

      {/* Manual Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={(open) => {
        setIsTransferDialogOpen(open)
        if (!open) {
          setEditingTransferId(null)
          setTransferForm({ from_branch: "", to_branch: "", items: [{ product: "", quantity: 1 }] })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-primary" /> {editingTransferId ? "Edit" : "Initiate"} Manual Stock Transfer
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                  <Label>Source (Optional)</Label>
                  <select 
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                    value={transferForm.from_branch}
                    onChange={(e) => setTransferForm({ ...transferForm, from_branch: e.target.value })}
                  >
                    <option value="">Central Warehouse</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
               <div className="space-y-1.5">
                  <Label>Destination Branch</Label>
                  <select 
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                    value={transferForm.to_branch}
                    onChange={(e) => setTransferForm({ ...transferForm, to_branch: e.target.value })}
                  >
                    <option value="">Select destination...</option>
                    {branches.map(b => !b.is_warehouse && <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
            </div>

            <div className="space-y-3">
              <Label>Items to Move</Label>
              {transferForm.items.map((item, idx) => (
                <div key={idx} className="flex gap-2 items-end">
                   <div className="flex-1">
                      <select 
                        className="w-full h-9 px-2 text-xs rounded-md border border-input bg-background"
                        value={item.product}
                        onChange={(e) => {
                          const newItems = [...transferForm.items]
                          newItems[idx].product = e.target.value
                          setTransferForm({ ...transferForm, items: newItems })
                        }}
                      >
                        <option value="">Select product...</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                   </div>
                   <Input 
                      type="number" 
                      className="w-20 h-9" 
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                         const newItems = [...transferForm.items]
                         newItems[idx].quantity = parseInt(e.target.value) || 0
                         setTransferForm({ ...transferForm, items: newItems })
                      }}
                   />
                   <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500" onClick={() => {
                      const newItems = transferForm.items.filter((_, i) => i !== idx)
                      setTransferForm({ ...transferForm, items: newItems.length ? newItems : [{ product: "", quantity: 1 }] })
                   }}>
                      <XCircle className="h-4 w-4" />
                   </Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => setTransferForm({ ...transferForm, items: [...transferForm.items, { product: "", quantity: 1 }]})}>
                 <Plus className="h-3 w-3 mr-1" /> Add Product
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTransfer}>{editingTransferId ? "Save Changes" : "Initiate Transfer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Request Dialog */}
      <Dialog open={isRequestDialogOpen} onOpenChange={(open) => {
        setIsRequestDialogOpen(open)
        if (!open) {
          setEditingRequestId(null)
          setRequestForm({ items: [{ product: "", quantity: 1 }], notes: "", branch: "" })
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> {editingRequestId ? "Edit" : "Request"} Stock for {isAdmin ? "Branch" : "Your Branch"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {isAdmin && (
               <div className="space-y-1.5 px-3">
                  <Label>Requesting Branch</Label>
                  <select 
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                    value={requestForm.branch}
                    onChange={(e) => setRequestForm({ ...requestForm, branch: e.target.value })}
                  >
                    <option value="">Select branch...</option>
                    {branches.map(b => !b.is_warehouse && <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
            )}
            
            {requestForm.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-7 gap-3 items-end p-3 bg-muted/30 rounded-lg">
                <div className="col-span-4 space-y-1.5">
                  <Label>Product</Label>
                  <select 
                    className="w-full h-9 px-3 text-sm rounded-md border border-input bg-background"
                    value={item.product}
                    onChange={(e) => {
                      const newItems = [...requestForm.items]
                      newItems[idx].product = e.target.value
                      setRequestForm({ ...requestForm, items: newItems })
                    }}
                  >
                    <option value="">Select product...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label>Qty</Label>
                  <Input 
                    type="number" 
                    className="h-9"
                    value={item.quantity} 
                    onChange={(e) => {
                      const newItems = [...requestForm.items]
                      newItems[idx].quantity = parseInt(e.target.value) || 0
                      setRequestForm({ ...requestForm, items: newItems })
                    }} 
                  />
                </div>
                <div className="col-span-1">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-rose-500 hover:text-rose-700" onClick={() => {
                    const newItems = requestForm.items.filter((_, i) => i !== idx)
                    setRequestForm({ ...requestForm, items: newItems.length ? newItems : [{ product: "", quantity: 1 }] })
                  }}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-fit" onClick={() => setRequestForm({ ...requestForm, items: [...requestForm.items, { product: "", quantity: 1 }]})}>
              <Plus className="h-3 w-3 mr-1" /> Add Another Item
            </Button>
            <div className="space-y-1.5">
              <Label>Internal Notes</Label>
              <Textarea placeholder="Urgency, specific batch details, etc..." value={requestForm.notes} onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestDialogOpen(false)}>Discard</Button>
            <Button onClick={handleSaveRequest} className="bg-primary hover:bg-primary/90">
              {editingRequestId ? "Save Changes" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Dialog */}
      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Inventory Control - New Catalog Item</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>SKU / Serial Number</Label>
              <Input value={productForm.sku} onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Selling Price ($)</Label>
                <Input type="number" value={productForm.base_price} onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Low Stock Alert</Label>
                <Input type="number" value={productForm.low_stock_threshold} onChange={(e) => setProductForm({ ...productForm, low_stock_threshold: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateProduct}>Register Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Batch Dialog (Original logic retained) */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        {/* Simplified for readability, keeping original logic */}
        <DialogContent>
           <DialogHeader><DialogTitle>Receive New Inventory Batch</DialogTitle></DialogHeader>
           <div className="grid gap-4 py-4">
              <Label>Product & Quantity Details</Label>
              {/* Reuse select/input logic from original if needed, but keeping it concise */}
              <div className="space-y-2">
                 <select className="w-full h-10 border rounded px-3" value={batchForm.product} onChange={e => setBatchForm({...batchForm, product: e.target.value})}>
                    <option value="">Select...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                 </select>
                 <Input placeholder="Quantity" type="number" value={batchForm.quantity} onChange={e => setBatchForm({...batchForm, quantity: e.target.value})} />
                 <Input placeholder="Cost per unit ($)" type="number" value={batchForm.cost_per_unit} onChange={e => setBatchForm({...batchForm, cost_per_unit: e.target.value})} />
              </div>
           </div>
           <DialogFooter>
              <Button onClick={handleCreateBatch}>Add to Stock</Button>
           </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" /> 
              {selectedProduct?.name} - Distribution Details
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
             <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-muted rounded-lg">
                   <p className="text-[10px] uppercase font-bold text-muted-foreground">Global Total</p>
                   <p className="text-2xl font-black">{selectedProduct?.available_stock || 0}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                   <p className="text-[10px] uppercase font-bold text-blue-600">Base Price</p>
                   <p className="text-2xl font-black text-blue-700">${parseFloat(selectedProduct?.base_price || 0).toFixed(2)}</p>
                </div>
             </div>
             
             <Label className="text-xs font-bold uppercase mb-2 block">Stock Breakdown by Location</Label>
             <div className="border rounded-xl overflow-hidden">
                <Table>
                   <TableHeader className="bg-slate-50">
                      <TableRow>
                         <TableHead>Location</TableHead>
                         <TableHead>Batch</TableHead>
                         <TableHead className="text-right">Quantity</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {productBatches.length === 0 ? (
                         <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground italic">No physical stock found in any branch.</TableCell></TableRow>
                      ) : (
                        productBatches.map((b, idx) => (
                           <TableRow key={idx}>
                              <TableCell className="font-semibold">
                                 {b.location_type === 'warehouse' ? 'Central Warehouse' : b.branch_name}
                              </TableCell>
                              <TableCell className="font-mono text-[10px]">#{b.batch_number}</TableCell>
                              <TableCell className="text-right font-bold">{b.quantity}</TableCell>
                           </TableRow>
                        ))
                      )}
                   </TableBody>
                </Table>
             </div>
          </div>
          <DialogFooter>
             <Button variant="secondary" onClick={() => setIsDetailsDialogOpen(false)}>Close Overview</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
