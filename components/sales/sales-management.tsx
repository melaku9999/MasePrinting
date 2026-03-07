"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ShoppingCart,
  Plus,
  Search,
  Filter,
  Package,
  Building2,
  Calendar,
  Clock,
  Boxes,
  ArrowUpRight,
  TrendingUp,
  LineChart,
  DollarSign,
  Check
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { salesApi, inventoryApi, branchesApi } from "@/lib/api"
import { SaleForm } from "./sale-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface SalesManagementProps {
  user: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
    employee_id?: number
    branch_id?: number
  }
}

export function SalesManagement({ user }: SalesManagementProps) {
  const isAdmin = user.role === "admin"
  const [activeTab, setActiveTab] = useState<"inventory" | "history">(isAdmin ? "history" : "inventory")
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sales, setSales] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [selectedInventoryIds, setSelectedInventoryIds] = useState<Set<number>>(new Set())
  const [preSelectedForSale, setPreSelectedForSale] = useState<any[]>([])
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSales: 0,
    topBranch: "N/A"
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [salesData, inventoryData, branchData] = await Promise.all([
        salesApi.getAll(isAdmin ? {} : { employee: user.employee_id }),
        inventoryApi.getBatches(isAdmin ? {} : { branch_id: user.branch_id }),
        branchesApi.getAll()
      ])

      setSales(salesData)
      setInventory(inventoryData)
      setBranches(branchData)

      const totalRev = salesData.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount), 0)
      setStats({
        totalRevenue: totalRev,
        totalSales: salesData.length,
        topBranch: branchData[0]?.name || "N/A"
      })

    } catch (error) {
      console.error("Error fetching sales data:", error)
      toast.error("Failed to load sales information")
    } finally {
      setLoading(false)
    }
  }

  const handleSellSelected = () => {
    const items = inventory
      .filter(item => selectedInventoryIds.has(item.id))
      .map(item => ({
        id: item.id, // Unique Inventory ID
        product: item.product,
        name: item.product_name,
        batch: item.batch_number,
        quantity: 1,
        unit_price: parseFloat(item.unit_price),
        available: item.quantity,
        branch_id: item.branch
      }))
    
    setPreSelectedForSale(items)
    setIsSaleFormOpen(true)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Sales Operations</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
            {isAdmin ? "Global Revenue Oversight & Transactional Integrity" : `Branch Commerce Registry â€¢ ${user.name}`}
          </p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setIsSaleFormOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95">
            <Plus className="h-4 w-4 mr-2" /> New Sale Transaction
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-blue-50 text-blue-600 transform group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Count</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">{stats.totalSales}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600 transform group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Branch</p>
              <p className="text-xl font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">{stats.topBranch}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 transform group-hover:scale-110 transition-transform">
              <Building2 className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full space-y-8">
        {/* Refined Control Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
          <div className="flex items-center gap-2 w-full md:w-auto p-1 bg-white rounded-lg shadow-sm ring-1 ring-slate-200">
            <TabsList className="bg-transparent p-0 h-9">
              {!isAdmin && (
                <TabsTrigger value="inventory" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md h-8 text-[11px] font-bold uppercase gap-2 px-4 transition-all">
                  <Boxes className="h-3.5 w-3.5" /> My Manifest
                </TabsTrigger>
              )}
              <TabsTrigger value="history" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-md h-8 text-[11px] font-bold uppercase gap-2 px-4 transition-all">
                <Clock className="h-3.5 w-3.5" /> Commerce Ledger
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="relative flex-1 group w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <Input 
              placeholder="Search records by customer, employee or batch ID..." 
              className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>


        <TabsContent value="inventory" className="pt-4">
          <div className="flex justify-between items-center mb-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Operational Asset Manifest</h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Global Stock Distribution & Branch Allocation</p>
            </div>
            {selectedInventoryIds.size > 0 && (
              <div className="flex gap-2 animate-in fade-in slide-in-from-right-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-9 px-4 rounded-xl text-slate-500 font-bold hover:bg-slate-100"
                  onClick={() => setSelectedInventoryIds(new Set())}
                >
                  Reset ({selectedInventoryIds.size})
                </Button>
                <Button 
                  size="sm" 
                  className="h-9 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg shadow-slate-200 transition-all active:scale-95 gap-2"
                  onClick={handleSellSelected}
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Execute Sale
                </Button>
              </div>
            )}
          </div>
          </div>
          <Card className="shadow-sm border">
             <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory
                    .filter(item => 
                      item.quantity > 0 && (
                        item.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        item.batch_number?.toString().includes(searchTerm)
                      )
                    )
                    .map((item) => {
                      const isSelected = selectedInventoryIds.has(item.id)
                    return (
                      <div 
                        key={item.id} 
                        className={cn(
                          "relative p-5 border transition-all duration-300 cursor-pointer group rounded-2xl",
                          isSelected 
                            ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900 shadow-lg shadow-slate-100" 
                            : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
                        )}
                        onClick={() => {
                          const newSelected = new Set(selectedInventoryIds)
                          if (isSelected) newSelected.delete(item.id)
                          else newSelected.add(item.id)
                          setSelectedInventoryIds(newSelected)
                        }}
                      >
                         <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Checkbox 
                              checked={isSelected} 
                              onCheckedChange={() => {}} 
                              className="border-slate-300 data-[state=checked]:bg-slate-900"
                            />
                         </div>
                         <div className="flex justify-between items-start mb-6">
                           <div className="flex flex-col gap-1.5">
                              <span className="font-black text-slate-900 text-lg leading-tight uppercase tracking-tight">{item.product_name}</span>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-500 border-none font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">
                                  Batch #{item.batch_number}
                                </Badge>
                                <Badge variant="outline" className="w-fit border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-widest px-2 py-0.5">
                                  {item.branch_name || "Central Repository"}
                                </Badge>
                              </div>
                           </div>
                           {isSelected && (
                             <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center">
                               <Check className="h-3.5 w-3.5 text-white" />
                             </div>
                           )}
                         </div>
                         <div className="flex justify-between text-sm items-center mt-auto pt-5 border-t border-slate-50">
                           <div className="flex flex-col gap-0.5">
                              <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Available Volume</span>
                              <span className="font-black text-2xl text-slate-900 tabular-nums">{item.quantity}</span>
                           </div>
                           <div className="flex flex-col text-right gap-0.5">
                              <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Unit Liquidity</span>
                              <span className="font-black text-xl text-slate-900 font-mono tracking-tighter">${parseFloat(item.unit_price).toFixed(2)}</span>
                           </div>
                         </div>
                      </div>
                    )
                  })}
                </div>
             </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="pt-4">
           <Card className="shadow-sm border">
             <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-bold">Audit History</CardTitle>
                <CardDescription>Full history of completed sales transactions</CardDescription>
             </CardHeader>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</TableHead>
                        {isAdmin && <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</TableHead>}
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Amount</TableHead>
                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</TableHead>
                        <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales
                        .filter(sale => 
                          sale.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.id.toString().includes(searchTerm) ||
                          sale.employee_name?.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((sale) => (
                          <TableRow key={sale.id} className="group hover:bg-slate-50 transition-colors border-slate-50">
                            <TableCell className="font-bold text-slate-900">{sale.customer_name}</TableCell>
                            {isAdmin && <TableCell className="text-xs font-semibold text-slate-500">{sale.employee_name}</TableCell>}
                            <TableCell className="font-black text-slate-900 font-mono">${parseFloat(sale.total_amount).toFixed(2)}</TableCell>
                            <TableCell className="text-xs font-bold text-slate-400">{new Date(sale.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => {
                                  setSelectedSale(sale)
                                  setIsDetailsOpen(true)
                                }}
                                className="h-8 rounded-lg text-xs font-bold hover:bg-white hover:text-slate-900 border border-transparent hover:border-slate-200"
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>

      <SaleForm 
        isOpen={isSaleFormOpen} 
        onClose={() => {
          setIsSaleFormOpen(false)
          setPreSelectedForSale([])
        }} 
        onSuccess={() => {
          fetchData()
          setSelectedInventoryIds(new Set())
        }} 
        user={user}
        preSelectedItems={preSelectedForSale}
      />

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Sale Transaction Details
            </DialogTitle>
            <DialogDescription>
              Transaction ID: #{selectedSale?.id} • {selectedSale && new Date(selectedSale.timestamp).toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400">Customer</p>
                  <p className="text-sm font-bold">{selectedSale.customer_name || "Guest Walk-in"}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] uppercase font-black text-slate-400">Branch</p>
                  <p className="text-sm font-bold">{selectedSale.branch_name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400">Processed By</p>
                  <p className="text-sm font-bold">{selectedSale.employee_name}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-[10px] uppercase font-black text-slate-400 mb-3 tracking-widest">Transaction Items</p>
                <div className="space-y-3">
                  {selectedSale.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <div className="flex flex-col">
                        <span className="font-bold">{item.product_name}</span>
                        <span className="text-xs text-slate-500">{item.quantity} x ${parseFloat(item.unit_price).toFixed(2)}</span>
                      </div>
                      <span className="font-mono font-black">
                        ${(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="bg-slate-50 p-4 rounded-xl flex justify-between items-center">
                <span className="text-sm font-black uppercase text-slate-500">Total Amount</span>
                <span className="text-2xl font-black text-blue-600 font-mono">
                  ${parseFloat(selectedSale.total_amount).toFixed(2)}
                </span>
              </div>
              
              {selectedSale.notes && (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-black text-slate-400">Notes</p>
                  <p className="text-sm text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    "{selectedSale.notes}"
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" className="w-full" onClick={() => setIsDetailsOpen(false)}>
              Close Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
