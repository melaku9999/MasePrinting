"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  AlertTriangle,
  ClipboardList,
  Search,
  History,
  CheckCircle2,
  Trash2,
  BarChart3,
  ChevronRight,
  Zap,
  TrendingUp,
  Package,
  Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { 
    getFnbInventoryStatus, 
    adjustFnbInventory, 
    getFnbConsumptionPreview, 
    markFnbInventoryEmpty, 
    getFnbClearanceHistory,
    getFnbExpenses,
    inventoryApi,
    createFnbExpense
} from "@/lib/api"
import { toast } from "sonner"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoungeInventory() {
  const [inventory, setInventory] = useState<any[]>([])
  const [clearanceHistory, setClearanceHistory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [adjustmentQty, setAdjustmentQty] = useState<string>("0")
  
  // Clearance Flow State
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false)
  const [clearancePreview, setClearancePreview] = useState<any>(null)
  const [isCommitingClearance, setIsCommitingClearance] = useState(false)
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null)
  const [stockInHistory, setStockInHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("monitor")
  
  // Product Registration State
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [productForm, setProductForm] = useState({
    name: "",
    sku: "",
    base_price: "0",
    low_stock_threshold: "5"
  })

  // Quick Purchase State
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [purchaseForm, setPurchaseForm] = useState({
    title: "",
    amount: "",
    productId: "",
    quantity: "1",
    notes: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [inv, clear, expenses] = await Promise.all([
        getFnbInventoryStatus(undefined, true),
        getFnbClearanceHistory(),
        getFnbExpenses()
      ])
      
      setInventory(inv || [])
      setClearanceHistory(clear || [])
      
      // Filter expenses to only show inventory purchases
      const purchases = (expenses || []).filter((e: any) => e.expense_type === 'inventory')
      setStockInHistory(purchases)
    } catch (err) {
      console.error("Error fetching lounge data:", err)
      toast.error("Failed to load inventory data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdjustment = async (quantity: number) => {
    if (!selectedProductId) {
        toast.error("Select a product to adjust")
        return
    }
    
    setIsLoading(true)
    try {
        await adjustFnbInventory({
            product_id: parseInt(selectedProductId),
            new_quantity: quantity,
        })
        toast.success("Stock adjusted successfully")
        setIsAdjustmentModalOpen(false)
        setSelectedProductId("")
        setAdjustmentQty("0")
        fetchData()
    } catch (err: any) {
        toast.error(err.message || "Adjustment failed")
    } finally {
        setIsLoading(false)
    }
  }

  const handlePreviewEmpty = async (productId: number) => {
    setIsLoading(true)
    try {
        const preview = await getFnbConsumptionPreview(productId)
        setClearancePreview({ ...preview, productId })
        setIsClearanceModalOpen(true)
    } catch (err: any) {
        toast.error(err.message || "Failed to generate preview")
    } finally {
        setIsLoading(false)
    }
  }

  const handleConfirmEmpty = async () => {
    if (!clearancePreview) return
    
    setIsCommitingClearance(true)
    try {
        await markFnbInventoryEmpty({ 
            product_id: clearancePreview.productId,
            notes: "Manually marked as empty by staff"
        })
        toast.success("Inventory cleared and report archived")
        setIsClearanceModalOpen(false)
        setClearancePreview(null)
        fetchData()
    } catch (err: any) {
        toast.error(err.message || "Clearance failed")
    } finally {
        setIsCommitingClearance(false)
    }
  }

  const handleRegisterProduct = async () => {
    if (!productForm.name) {
      toast.error("Please provide a name")
      return
    }
    setIsLoading(true)
    try {
      await inventoryApi.createProduct({
        ...productForm,
        business_type: 'fnb',
        base_price: parseFloat(productForm.base_price),
        low_stock_threshold: parseFloat(productForm.low_stock_threshold)
      })
      toast.success("New asset registered")
      setIsRegisterModalOpen(false)
      setProductForm({ name: "", sku: "", base_price: "0", low_stock_threshold: "5" })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Registration failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecordPurchase = async () => {
    if (!purchaseForm.productId || !purchaseForm.amount || !purchaseForm.quantity) {
      toast.error("Please fill in item, amount and quantity")
      return
    }
    setIsLoading(true)
    try {
      await createFnbExpense({
        title: purchaseForm.title || `Stock Up: ${inventory.find(i => i.id.toString() === purchaseForm.productId)?.name}`,
        amount: parseFloat(purchaseForm.amount),
        expense_type: 'inventory',
        inventory_product: parseInt(purchaseForm.productId),
        inventory_quantity: parseFloat(purchaseForm.quantity),
        category: 'Supplies',
        notes: purchaseForm.notes
      })
      toast.success("Purchase recorded and stock updated")
      setIsPurchaseModalOpen(false)
      setPurchaseForm({ title: "", amount: "", productId: "", quantity: "1", notes: "" })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Purchase recording failed")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const lowStockCount = inventory.filter(i => i.is_low && parseFloat(i.total_stock) > 0).length
  
  const avgEfficiency = clearanceHistory.length > 0 
    ? clearanceHistory.reduce((sum, log) => sum + parseFloat(log.efficiency_pct), 0) / clearanceHistory.length 
    : 0
  
  const totalWaste = clearanceHistory.reduce((sum, log) => sum + parseFloat(log.untracked_consumption), 0)

  // Calculate monthly stock-in volume
  const monthlyStockIn = stockInHistory.reduce((sum: number, p: any) => sum + parseFloat(p.inventory_quantity), 0)

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col bg-[#0a0a0b] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Liquid Assets
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase tracking-[0.2em] text-[10px] font-black">Bar Logic</Badge>
                </h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Real-time inventory and ingredient health</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                        placeholder="Search assets..." 
                        className="pl-11 h-11 bg-black/40 border-white/10 text-white rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                
                <Dialog open={isAdjustmentModalOpen} onOpenChange={setIsAdjustmentModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="h-11 px-6 rounded-xl border-dashed border-amber-500/40 text-amber-500 hover:bg-amber-500/5 font-black uppercase tracking-widest text-[10px]">
                            Stock Adjustment
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white backdrop-blur-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">Manual stock adjustment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-6" id="adj-modal-content">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Asset Selection</Label>
                                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                    <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 rounded-xl">
                                        <SelectValue placeholder="Choose ingredient/item" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        {inventory.map(i => <SelectItem key={i.id} value={i.id.toString()} className="font-bold hover:bg-white/5 focus:bg-white/5">{i.name} (Current: {i.total_stock})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">New Quantity (Units)</Label>
                                    <Input 
                                        type="number" 
                                        className="bg-black/40 border-white/10 text-white h-12 text-2xl font-black text-center rounded-xl focus:border-amber-500/50 focus:ring-amber-500/20"
                                        value={adjustmentQty}
                                        onChange={e => setAdjustmentQty(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-1">
                                    <Button 
                                        className="h-12 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] rounded-xl shadow-lg shadow-amber-500/10"
                                        onClick={() => handleAdjustment(parseFloat(adjustmentQty))}
                                    >
                                        Update Asset Valuation
                                    </Button>
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-500 leading-relaxed italic border-l-2 border-amber-500/20 pl-4">
                                To mark an item as finished and see the full consumption breakdown and variance report, use the "Mark Empty" icon in the main inventory table.
                            </p>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="h-11 px-6 rounded-xl border-dashed border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/5 font-black uppercase tracking-widest text-[10px]">
                            <Plus className="mr-2 h-4 w-4" /> Register New Asset
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white backdrop-blur-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">Register New Diva Asset</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Asset Name</Label>
                                <Input 
                                    placeholder="e.g. Absolut Vodka (1L)" 
                                    className="bg-black/40 border-white/10 text-white h-12 rounded-xl focus:border-amber-500/50"
                                    value={productForm.name}
                                    onChange={e => setProductForm({...productForm, name: e.target.value})}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">SKU / Identifier</Label>
                                    <Input 
                                        placeholder="Optional" 
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-mono"
                                        value={productForm.sku}
                                        onChange={e => setProductForm({...productForm, sku: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Alert Threshold</Label>
                                    <Input 
                                        type="number" 
                                        className="bg-black/40 border-white/10 text-white h-12 rounded-xl"
                                        value={productForm.low_stock_threshold}
                                        onChange={e => setProductForm({...productForm, low_stock_threshold: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Base Unit Price</Label>
                                <Input 
                                    type="number"
                                    placeholder="0.00"
                                    className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-mono"
                                    value={productForm.base_price}
                                    onChange={e => setProductForm({...productForm, base_price: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter className="pt-4 border-t border-white/5">
                            <Button onClick={handleRegisterProduct} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest text-[10px] h-12 rounded-xl shadow-lg">
                                {isLoading ? "Archiving..." : "Create Asset Entry"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-500 hover:bg-amber-400 text-black font-black h-11 px-8 rounded-xl shadow-xl shadow-amber-500/20 transition-all active:scale-95">
                            <Plus className="mr-2 h-4 w-4" /> Record Purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white backdrop-blur-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">Record Asset Procurement</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Target Asset</Label>
                                <Select value={purchaseForm.productId} onValueChange={v => setPurchaseForm({...purchaseForm, productId: v})}>
                                    <SelectTrigger className="bg-black/40 border-white/10 h-12 rounded-xl text-white font-bold">
                                        <SelectValue placeholder="Select asset to restock" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white font-bold">
                                        {inventory.map(i => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Volume (Units)</Label>
                                    <Input 
                                        type="number" 
                                        className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono text-center text-xl"
                                        value={purchaseForm.quantity}
                                        onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Acquisition Cost (ETB)</Label>
                                    <Input 
                                        type="number" 
                                        placeholder="0.00"
                                        className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono text-center text-xl"
                                        value={purchaseForm.amount}
                                        onChange={e => setPurchaseForm({...purchaseForm, amount: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4">
                                <p className="text-[9px] font-black text-amber-500 uppercase leading-tight tracking-widest">
                                    This operation will create an automated Stock-In batch and record a supply expense for this month.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="pt-4 border-t border-white/5">
                            <Button onClick={handleRecordPurchase} className="w-full bg-amber-500 hover:bg-amber-400 text-black font-black h-12 rounded-xl shadow-lg uppercase tracking-widest text-[10px]">
                                {isLoading ? "Archiving..." : "Commit Purchase & Add Stock"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
            <StatCard 
                title="Critical Monitoring" 
                value={lowStockCount} 
                color={lowStockCount > 0 ? "text-red-500" : "text-zinc-500"} 
                icon={<AlertTriangle className="h-6 w-6" />} 
            />
            <StatCard 
                title="Efficiency Index" 
                value={`${avgEfficiency.toFixed(0)}%`} 
                color={avgEfficiency >= 90 ? "text-amber-500" : avgEfficiency >= 75 ? "text-amber-400" : "text-red-500"} 
                icon={<TrendingUp className="h-6 w-6" />} 
            />
            <StatCard 
                title="Procured Volume" 
                value={`${monthlyStockIn.toFixed(1)} Units`} 
                color="text-amber-500" 
                icon={<Plus className="h-6 w-6" />} 
            />
            <StatCard 
                title="Active Portfolio" 
                value={`${inventory.length} SKUs`} 
                color="text-white" 
                icon={<ClipboardList className="h-6 w-6" />} 
            />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col space-y-6">
            <TabsList className="bg-black/40 border border-white/5 p-1.5 rounded-2xl w-fit backdrop-blur-xl">
                <TabsTrigger value="monitor" className="font-black px-8 py-2.5 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all uppercase tracking-widest text-[10px]">
                    Ingredient Health
                </TabsTrigger>
                <TabsTrigger value="purchases" className="font-black px-8 py-2.5 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all uppercase tracking-widest text-[10px]">
                    Stock-In Ledger
                </TabsTrigger>
                <TabsTrigger value="history" className="font-black px-8 py-2.5 rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black transition-all uppercase tracking-widest text-[10px]">
                    Clearance Archive
                </TabsTrigger>
            </TabsList>

            <TabsContent value="monitor" className="flex-1 min-h-0 m-0">
                <Card className="bg-zinc-900/40 border-white/5 h-full flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
                    <CardHeader className="shrink-0 border-b border-white/5 bg-black/20 p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Liquidity Monitor</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 sticky top-0 z-10 tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Ingredient / Brand</th>
                                        <th className="px-8 py-5 text-center">Remaining Volume</th>
                                        <th className="px-8 py-5 text-center">Critical Ceiling</th>
                                        <th className="px-8 py-5 text-center">health status</th>
                                        <th className="px-8 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredInventory.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6 font-black text-white tracking-tight uppercase text-xs">{item.name}</td>
                                            <td className="px-8 py-6 text-center text-zinc-400 font-mono text-sm">
                                                <span className={cn(parseFloat(item.total_stock) < 0 ? "text-red-500 font-black" : "text-white")}>
                                                    {parseFloat(item.total_stock).toFixed(2)}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 ml-1.5 font-black">VOL</span>
                                            </td>
                                            <td className="px-8 py-6 text-center text-zinc-500 font-black text-[10px] uppercase tracking-widest">{item.low_stock_threshold} UNITS</td>
                                            <td className="px-8 py-6 text-center">
                                                {item.is_low ? (
                                                    <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-widest">At Risk</Badge>
                                                ) : (
                                                    <Badge variant="outline" className="border-amber-500/20 text-amber-500 bg-amber-500/5 px-3 py-1 font-black text-[10px] uppercase tracking-widest">Optimal</Badge>
                                                )}
                                            </td>
                                             <td className="px-8 py-6 text-right">
                                                 <div className="flex items-center justify-end gap-3">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-9 w-9 rounded-xl hover:bg-amber-500/10 hover:text-amber-500 p-0 transition-all border border-white/5"
                                                        onClick={() => {
                                                            setPurchaseForm({...purchaseForm, productId: item.id.toString()})
                                                            setIsPurchaseModalOpen(true)
                                                        }}
                                                        title="Quick Purchase Record"
                                                    >
                                                        <Plus className="h-4 w-4" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="sm" 
                                                        className="h-9 w-9 rounded-xl hover:bg-red-500/10 hover:text-red-500 p-0 transition-all border border-white/5"
                                                        onClick={() => handlePreviewEmpty(item.id)}
                                                        title="Mark Empty & Generate Breakdown"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                 </div>
                                             </td>
                                        </tr>
                                    ))}
                                    {filteredInventory.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-24 text-center text-zinc-700 font-black uppercase tracking-[0.4em] opacity-40">Ambient Scan: No assets found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="history" className="flex-1 min-h-0 m-0">
                <Card className="bg-zinc-900/40 border-white/5 h-full flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
                    <CardHeader className="shrink-0 border-b border-white/5 bg-black/20 p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Clearance Archive</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 sticky top-0 z-10 tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Inventory Product</th>
                                        <th className="px-8 py-5">Closure Timestamp</th>
                                        <th className="px-8 py-5 text-center">Batch Volume</th>
                                        <th className="px-8 py-5 text-center">Revenue Yield</th>
                                        <th className="px-8 py-5 text-center">Efficiency Score</th>
                                        <th className="px-8 py-5 text-center">Untracked Loss</th>
                                        <th className="px-8 py-5 text-right">Officer</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {clearanceHistory.map((log: any) => (
                                        <React.Fragment key={log.id}>
                                            <tr 
                                                className="hover:bg-white/[0.02] transition-colors group cursor-pointer"
                                                onClick={() => setExpandedRowId(expandedRowId === log.id ? null : log.id)}
                                            >
                                                <td className="px-8 py-6 font-black text-white tracking-tight flex items-center gap-4 uppercase text-xs">
                                                    <ChevronRight className={cn("h-4 w-4 transition-transform text-zinc-500", expandedRowId === log.id && "rotate-90 text-amber-500")} />
                                                    {log.inventory_product_name}
                                                </td>
                                                <td className="px-8 py-6 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                    {new Date(log.cleared_at).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6 text-center font-mono font-black text-white text-xs">
                                                    {parseFloat(log.starting_quantity).toFixed(2)} VOL
                                                </td>
                                                <td className="px-8 py-6 text-center font-mono font-black text-amber-500 text-base">
                                                    ETB {parseFloat(log.total_revenue).toLocaleString()}
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    <Badge className={cn(
                                                        "font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-lg",
                                                        parseFloat(log.efficiency_pct) >= 90 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                        parseFloat(log.efficiency_pct) >= 75 ? "bg-amber-500/5 text-amber-400 border-amber-500/10" :
                                                        "bg-red-500/10 text-red-500 border-red-500/20"
                                                    )}>
                                                        {parseFloat(log.efficiency_pct).toFixed(0)}% Index
                                                    </Badge>
                                                </td>
                                                <td className="px-8 py-6 text-center text-red-500 font-mono text-xs font-black">
                                                    {parseFloat(log.untracked_consumption).toFixed(2)} VOL
                                                </td>
                                                <td className="px-8 py-6 text-right font-black text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                                                    {log.cleared_by_name}
                                                </td>
                                            </tr>
                                            {expandedRowId === log.id && (
                                                <tr className="bg-black/40 border-t-0 animate-in slide-in-from-top-2 duration-300">
                                                    <td colSpan={7} className="px-12 py-8">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                            {log.consumption_breakdown && log.consumption_breakdown.map((item: any) => (
                                                                <div key={item.product_id} className="bg-zinc-900 border border-white/5 rounded-2xl p-5 shadow-2xl border-l-2 border-l-amber-500/40">
                                                                    <div className="flex justify-between items-start mb-3">
                                                                        <p className="font-black text-[10px] tracking-widest uppercase text-white truncate mr-2">{item.product_name}</p>
                                                                        <Badge variant="outline" className="text-[9px] h-5 border-amber-500/30 text-amber-500 font-black uppercase">{item.units_sold} sold</Badge>
                                                                    </div>
                                                                    <div className="flex justify-between items-end">
                                                                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em]">
                                                                            Consumed: {parseFloat(item.inventory_consumed).toFixed(2)}
                                                                        </div>
                                                                        <div className="text-xs font-black text-amber-500">
                                                                            ETB {parseFloat(item.revenue).toLocaleString()}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {(!log.consumption_breakdown || log.consumption_breakdown.length === 0) && (
                                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest italic col-span-full opacity-50">No algorithmic breakdown available</p>
                                                            )}
                                                        </div>
                                                        {log.notes && (
                                                            <div className="mt-6 pt-6 border-t border-white/5">
                                                                <p className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.3em] mb-2">Internal Remarks</p>
                                                                <p className="text-xs text-white font-medium italic opacity-80">"{log.notes}"</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {clearanceHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-24 text-center text-zinc-700 font-black uppercase tracking-[0.4em] opacity-40">Archive Empty</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="purchases" className="flex-1 min-h-0 m-0">
                <Card className="bg-zinc-900/40 border-white/5 h-full flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
                    <CardHeader className="shrink-0 border-b border-white/5 bg-black/20 p-6 flex flex-row items-center justify-between">
                        <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Stock-In Ledger</CardTitle>
                        <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-black uppercase tracking-[0.2em] text-[10px] px-3 py-1">Automated Record</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        <ScrollArea className="h-full">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 sticky top-0 z-10 tracking-[0.2em]">
                                    <tr>
                                        <th className="px-8 py-5">Date</th>
                                        <th className="px-8 py-5">Linked Asset</th>
                                        <th className="px-8 py-5 text-center">Qty Added</th>
                                        <th className="px-8 py-5 text-center">Acquisition Cost</th>
                                        <th className="px-8 py-5 text-center">Unit Valuation</th>
                                        <th className="px-8 py-5 text-right">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {stockInHistory.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-8 py-6 text-zinc-500 font-black text-[10px] uppercase tracking-widest">
                                              {new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className="px-8 py-6">
                                              <div className="flex flex-col">
                                                <span className="font-black text-white tracking-tight uppercase text-xs">{inventory.find((inv: any) => inv.id === p.inventory_product)?.name || 'Direct Stock Up'}</span>
                                                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.2em] mt-1">{p.title}</span>
                                              </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 font-black px-4 py-1.5 text-[10px] tracking-widest rounded-lg">
                                                +{parseFloat(p.inventory_quantity).toFixed(2)} VOL
                                              </Badge>
                                            </td>
                                            <td className="px-8 py-6 text-center font-black text-white text-base">ETB {parseFloat(p.amount).toLocaleString()}</td>
                                            <td className="px-8 py-6 text-center">
                                              <div className="inline-flex font-mono text-[10px] font-black text-zinc-400 bg-black/40 border border-white/5 shadow-inner px-3 py-1.5 rounded-xl">
                                                ETB {(parseFloat(p.amount) / parseFloat(p.inventory_quantity)).toFixed(2)}
                                              </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest opacity-60">
                                                {p.notes || `#EXP-${p.id}`}
                                              </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {stockInHistory.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="py-24 text-center text-zinc-700 font-black uppercase tracking-[0.4em] opacity-40">No entries detected</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>

        {/* --- STOCK CLEARANCE BREAKDOWN MODAL --- */}
        {/* --- STOCK CLEARANCE BREAKDOWN MODAL --- */}
        <Dialog open={isClearanceModalOpen} onOpenChange={setIsClearanceModalOpen}>
            <DialogContent className="max-w-2xl bg-[#0a0a0b] border-white/10 p-0 overflow-hidden rounded-3xl shadow-2xl flex flex-col h-[85vh] text-white">
                {clearancePreview && (
                    <>
                        {/* Header */}
                        <div className="px-10 py-8 border-b border-white/5 bg-white/[0.01] shrink-0">
                            <h2 className="text-3xl font-black tracking-tighter text-white uppercase italic">
                                {inventory.find(i => i.id === clearancePreview.productId)?.name} — Inventory Closure
                            </h2>
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] mt-2 opacity-70">
                                Period: {new Date(clearancePreview.period_start).toLocaleDateString()} — Present
                            </p>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-10 space-y-12">
                                {/* Section: Starting Volume */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Starting Stock</h3>
                                    <div className="flex items-baseline gap-3">
                                        <p className="text-4xl font-black text-white tracking-tighter">
                                            {clearancePreview.starting_quantity} Units
                                        </p>
                                    </div>
                                    {clearancePreview.starting_quantity <= 0 && (
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 w-fit mt-2">
                                            <AlertTriangle className="h-3 w-3 text-red-500" />
                                            <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">No procurement history detected</span>
                                        </div>
                                    )}
                                </div>

                                <Separator className="bg-white/5" />
                                
                                {/* Section: Consumption Breakdown */}
                                <div className="space-y-6">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Consumed by Products</h3>
                                    <div className="space-y-5">
                                        {clearancePreview.breakdown.map((item: any) => (
                                            <div key={item.product_id} className="flex justify-between items-center group">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                                                    <div className="flex items-center gap-8">
                                                        <span className="font-black text-sm text-white uppercase tracking-tight truncate w-[180px]">{item.product_name}</span>
                                                        <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                                                            {item.units_sold} sold
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-zinc-700 text-xs">→</span>
                                                    <span className="font-mono font-black text-amber-500">{item.inventory_consumed.toFixed(2)} units</span>
                                                </div>
                                            </div>
                                        ))}
                                        {clearancePreview.breakdown.length === 0 && (
                                            <p className="text-xs italic text-zinc-600 font-black uppercase tracking-widest opacity-50">Zero sales data registered</p>
                                        )}
                                    </div>
                                    <div className="pt-6 border-t border-white/5">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic mb-2">Total Used</h3>
                                        <p className="text-2xl font-black text-white tracking-tighter">{clearancePreview.total_consumed.toFixed(2)} units</p>
                                    </div>
                                </div>

                                <Separator className="bg-white/5" />

                                {/* Summary Narrative */}
                                <div className="space-y-10 bg-white/[0.01] p-10 rounded-3xl border border-white/5 shadow-inner">
                                    <div className="space-y-1">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 italic">Expected Remaining</h3>
                                        <p className="text-2xl font-black text-zinc-300 tracking-tighter">{(clearancePreview.starting_quantity - clearancePreview.total_consumed).toFixed(2)} units</p>
                                    </div>
                                    
                                    <div className="space-y-1 border-t border-white/5 pt-8">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 italic">Actual Stock</h3>
                                        <p className="text-4xl font-black text-amber-500 tracking-tighter">{parseFloat(clearancePreview.current_stock).toFixed(2)} units</p>
                                    </div>

                                    <div className="space-y-1 border-t border-white/5 pt-8">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 italic">Variance</h3>
                                        <p className="text-4xl font-black text-red-500 tracking-tighter">
                                            {clearancePreview.untracked.toFixed(2)} units
                                        </p>
                                    </div>
                                </div>
                                
                                {/* Efficiency Section */}
                                <div className="pt-4 pb-8">
                                    <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl flex items-center justify-between shadow-inner">
                                        <div>
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-2">Liquidity Efficiency Score</p>
                                            <p className="text-4xl font-black text-white tracking-tighter font-mono italic">
                                                {clearancePreview.efficiency_pct.toFixed(1)}%
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest opacity-60">
                                                {clearancePreview.actual_servings} Served / {clearancePreview.expected_servings.toFixed(0)} Target
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-10 py-8 border-t border-white/5 bg-black shrink-0">
                            <div className="flex flex-col gap-4">
                                <Button 
                                    onClick={handleConfirmEmpty} 
                                    disabled={isCommitingClearance}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-black h-16 rounded-2xl shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all text-sm uppercase tracking-[0.2em]"
                                >
                                    {isCommitingClearance ? "Archiving Record..." : "Confirm & Commit to Archive"}
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    className="w-full text-zinc-500 hover:text-white font-black uppercase tracking-[0.3em] text-[10px] h-10 hover:bg-white/5 rounded-xl transition-all" 
                                    onClick={() => setIsClearanceModalOpen(false)}
                                >
                                    Cancel Inspection
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    </div>
  )
}

function StatCard({ title, value, color, icon }: { title: string, value: any, color: string, icon: any }) {
    return (
        <Card className="bg-zinc-900/40 border-white/5 rounded-2xl shadow-2xl overflow-hidden group hover:border-amber-500/20 transition-all backdrop-blur-xl">
            <CardContent className="p-7 flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5", color)}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-1.5">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
