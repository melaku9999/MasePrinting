"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  TrendingDown, 
  Filter, 
  Download, 
  Loader2,
  ShoppingCart,
  Building,
  Calendar as CalendarIcon,
  Search,
  ArrowDownRight,
  Boxes,
  Package,
  DollarSign,
  Clock,
  Building2
} from "lucide-react"
import { financialApi, branchesApi, inventoryApi, expensesApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface ExpenseManagementProps {
  user: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
    branch_id?: number
  }
}

export function ExpenseManagement({ user }: ExpenseManagementProps) {
  const isAdmin = user.role === "admin"
  const [expenses, setExpenses] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filters
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Record Purchase Modal
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseForm, setPurchaseForm] = useState({
    productId: "",
    branchId: user.branch_id?.toString() || "",
    quantity: "1",
    unitCost: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  })

  // Record General Expense Modal
  const [isGeneralModalOpen, setIsGeneralModalOpen] = useState(false)
  const [generalLoading, setGeneralLoading] = useState(false)
  const [generalForm, setGeneralForm] = useState({
    title: "",
    amount: "",
    category: "",
    branchId: user.branch_id?.toString() || "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  })

  const categories = [
    "Utilities",
    "Salaries",
    "Rent",
    "Office Supplies",
    "Marketing",
    "Maintenance",
    "Transportation",
    "Other"
  ]

  useEffect(() => {
    fetchData()
    fetchBranches()
    fetchProducts()
  }, [])

  const fetchBranches = async () => {
    try {
      const res = await branchesApi.getAll()
      setBranches(res)
    } catch (err) {
      console.error("Error fetching branches:", err)
    }
  }

  const fetchProducts = async () => {
    try {
      const res = await inventoryApi.getProducts()
      setProducts(res)
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await expensesApi.getAll()
      setExpenses(res)
    } catch (err) {
      console.error("Error fetching expenses:", err)
      toast.error("Failed to load expenses")
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPurchase = async () => {
    if (!purchaseForm.productId || !purchaseForm.quantity || !purchaseForm.unitCost || !purchaseForm.branchId) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setPurchaseLoading(true)
      const product = products.find(p => p.id.toString() === purchaseForm.productId)
      const branch = branches.find(b => b.id.toString() === purchaseForm.branchId)
      
      const totalAmount = parseFloat(purchaseForm.unitCost) * parseInt(purchaseForm.quantity)
      
      // 1. Record the Expense
      await expensesApi.create({
        title: `Purchase: ${product?.name} (${purchaseForm.quantity} units)`,
        amount: totalAmount,
        category: "Inventory Purchase",
        branch: parseInt(purchaseForm.branchId),
        date: purchaseForm.date,
        notes: purchaseForm.notes || `Purchased for ${branch?.name}`
      })

      // 2. Update Inventory (Create Batch)
      await inventoryApi.createBatch({
        product: parseInt(purchaseForm.productId),
        quantity: parseInt(purchaseForm.quantity),
        cost_per_unit: parseFloat(purchaseForm.unitCost),
        location_type: 'branch',
        branch: parseInt(purchaseForm.branchId)
      })

      toast.success("Purchase recorded and inventory updated successfully")
      setIsPurchaseModalOpen(false)
      setPurchaseForm({
        productId: "",
        branchId: user.branch_id?.toString() || "",
        quantity: "1",
        unitCost: "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (err: any) {
      console.error("Error recording purchase:", err)
      toast.error(err.message || "Failed to record purchase")
    } finally {
      setPurchaseLoading(false)
    }
  }

  const handleRecordGeneralExpense = async () => {
    if (!generalForm.title || !generalForm.amount || !generalForm.category || !generalForm.branchId) {
      toast.error("Please fill all required fields")
      return
    }

    try {
      setGeneralLoading(true)
      await expensesApi.create({
        title: generalForm.title,
        amount: parseFloat(generalForm.amount),
        category: generalForm.category,
        branch: parseInt(generalForm.branchId),
        date: generalForm.date,
        notes: generalForm.notes
      })

      toast.success("General expense recorded successfully")
      setIsGeneralModalOpen(false)
      setGeneralForm({
        title: "",
        amount: "",
        category: "",
        branchId: user.branch_id?.toString() || "",
        notes: "",
        date: new Date().toISOString().split('T')[0]
      })
      fetchData()
    } catch (err: any) {
      console.error("Error recording expense:", err)
      toast.error(err.message || "Failed to record expense")
    } finally {
      setGeneralLoading(false)
    }
  }

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      // Branch filtering: Employees only see their branch, admins see global/filtered
      const matchesBranch = isAdmin 
        ? (selectedBranch === "all" || e.branch?.toString() === selectedBranch)
        : (e.branch === user.branch_id)

      const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           e.category.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesBranch && matchesSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, selectedBranch, searchQuery, isAdmin, user.branch_id])

  const stats = useMemo(() => {
    const total = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    const count = filteredExpenses.length
    return { total, count }
  }, [filteredExpenses])

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Treasury & Expenses</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest"> procurement flow & financial oversight </p>
        </div>
        <div className="flex items-center gap-2">
           <Button onClick={() => setIsPurchaseModalOpen(true)} variant="outline" className="h-11 px-6 rounded-xl border-slate-200 bg-white text-slate-900 font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95">
             <Package className="h-4 w-4 mr-2" /> Purchase Entry
           </Button>
           <Button onClick={() => setIsGeneralModalOpen(true)} className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95">
             <Plus className="h-4 w-4 mr-2" /> Record Expense
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Atmosphere Value</p>
              <p className="text-3xl font-black text-slate-900 tabular-nums">${stats.total.toLocaleString()}</p>
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
              <p className="text-3xl font-black text-slate-900 tabular-nums">{stats.count}</p>
            </div>
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-amber-50 text-amber-600 transform group-hover:scale-110 transition-transform">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
        {isAdmin && (
           <Card className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Strategic Hub</p>
                <p className="text-xl font-black text-slate-900 uppercase tracking-tighter truncate max-w-[150px]">
                  {selectedBranch === 'all' ? 'Global Network' : branches.find(b => b.id.toString() === selectedBranch)?.name || 'Branch Hub'}
                </p>
              </div>
              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600 transform group-hover:scale-110 transition-transform">
                <Building2 className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Refined Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search ledgers by title, category or context..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          {isAdmin && (
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="w-full md:w-[180px] h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900 rounded-lg text-xs font-black uppercase text-slate-700">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-bold uppercase">All Global Hubs</SelectItem>
                {branches.map(b => (
                  <SelectItem key={b.id} value={b.id.toString()} className="text-xs font-bold uppercase">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Expense Ledger</CardTitle>
          <CardDescription>Detailed history of all outgoing cash flow</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Transaction Date</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Description & Context</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Operational Category</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Strategic Branch</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Debit Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm font-medium">Calibrating treasury history...</TableCell></TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-slate-400 text-sm font-medium">No financial movements identified.</TableCell></TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id} className="border-slate-50 group hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900">{new Date(expense.date).toLocaleDateString()}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(expense.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="font-bold text-slate-900 text-sm">{expense.title}</div>
                      {expense.notes && <div className="text-[10px] text-slate-400 font-medium italic truncate max-w-[300px]">{expense.notes}</div>}
                    </TableCell>
                    <TableCell className="px-6 text-xs font-bold text-slate-600 uppercase tracking-tighter">
                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 font-bold text-[10px] px-2 py-0.5">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 uppercase tracking-tight">
                        <Building2 className="h-3.5 w-3.5 text-slate-400" />
                        {branches.find(b => b.id.toString() === expense.branch?.toString())?.name || "Global Hub"}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 text-right font-black text-rose-600 tabular-nums">
                      -${parseFloat(expense.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Record Purchase Modal */}
      <Dialog open={isPurchaseModalOpen} onOpenChange={setIsPurchaseModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" /> Record Product Purchase
            </DialogTitle>
            <DialogDescription>
              Record a purchase that updates both the financial ledger and inventory levels.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Product (Global Stock)</Label>
              <Select value={purchaseForm.productId} onValueChange={(v) => setPurchaseForm({...purchaseForm, productId: v})}>
                <SelectTrigger><SelectValue placeholder="Select product..." /></SelectTrigger>
                <SelectContent>
                  {products.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} ({p.sku})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Quantity</Label>
                <Input type="number" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({...purchaseForm, quantity: e.target.value})} min="1" />
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Unit Cost ($)</Label>
                <Input type="number" step="0.01" value={purchaseForm.unitCost} onChange={(e) => setPurchaseForm({...purchaseForm, unitCost: e.target.value})} placeholder="0.00" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Destination Branch</Label>
              {isAdmin ? (
                <Select value={purchaseForm.branchId} onValueChange={(v) => setPurchaseForm({...purchaseForm, branchId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select branch..." /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border/50">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {branches.find(b => b.id.toString() === purchaseForm.branchId)?.name || "Your Assigned Branch"}
                  </span>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Boxes className="h-3 w-3" /> Stock will be automatically added to this branch.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Purchase Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="date" className="pl-9" value={purchaseForm.date} onChange={(e) => setPurchaseForm({...purchaseForm, date: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Internal Notes</Label>
              <Textarea value={purchaseForm.notes} onChange={(e) => setPurchaseForm({...purchaseForm, notes: e.target.value})} placeholder="Purchase details, supplier info..." />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsPurchaseModalOpen(false)}>Cancel</Button>
             <Button onClick={handleRecordPurchase} disabled={purchaseLoading || !purchaseForm.productId || !purchaseForm.unitCost}>
               {purchaseLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
               Finalize Purchase
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record General Expense Modal */}
      <Dialog open={isGeneralModalOpen} onOpenChange={setIsGeneralModalOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-500" /> Record General Expense
            </DialogTitle>
            <DialogDescription>
              Record non-inventory business costs like rent, utilities, or maintenance.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Expense Title</Label>
              <Input 
                placeholder="e.g. Monthly Rent, Office Snacks..." 
                value={generalForm.title} 
                onChange={(e) => setGeneralForm({...generalForm, title: e.target.value})} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={generalForm.category} onValueChange={(v) => setGeneralForm({...generalForm, category: v})}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Amount ($)</Label>
                <Input 
                  type="number" 
                  step="0.01" 
                  value={generalForm.amount} 
                  onChange={(e) => setGeneralForm({...generalForm, amount: e.target.value})} 
                  placeholder="0.00" 
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Applicable Branch</Label>
              {isAdmin ? (
                <Select value={generalForm.branchId} onValueChange={(v) => setGeneralForm({...generalForm, branchId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select branch..." /></SelectTrigger>
                  <SelectContent>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md border border-border/50">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {branches.find(b => b.id.toString() === generalForm.branchId)?.name || "Your Assigned Branch"}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-sm font-medium">Expense Date</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-9" 
                    value={generalForm.date} 
                    onChange={(e) => setGeneralForm({...generalForm, date: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-sm font-medium">Internal Notes</Label>
              <Textarea 
                value={generalForm.notes} 
                onChange={(e) => setGeneralForm({...generalForm, notes: e.target.value})} 
                placeholder="Details about the transaction..." 
              />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsGeneralModalOpen(false)}>Cancel</Button>
             <Button 
               onClick={handleRecordGeneralExpense} 
               className="bg-amber-600 hover:bg-amber-700 text-white"
               disabled={generalLoading || !generalForm.title || !generalForm.amount}
             >
               {generalLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
               Record Expense
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
