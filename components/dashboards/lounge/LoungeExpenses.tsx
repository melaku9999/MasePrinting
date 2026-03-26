"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  TrendingUp,
  Receipt,
  Search,
  DollarSign,
  Trash2,
  Edit2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getFnbExpenses, createFnbExpense, updateFnbExpense, deleteFnbExpense, getFnbInventoryStatus } from "@/lib/api"
import { toast } from "sonner"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LoungeExpenses() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [inventoryProducts, setInventoryProducts] = useState<any[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "Operations",
    expense_type: "normal",
    inventory_product: "",
    inventory_quantity: "0",
    notes: ""
  })
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [expData, invData] = await Promise.all([
        getFnbExpenses(),
        getFnbInventoryStatus(undefined, true)
      ])
      setExpenses(expData || [])
      setInventoryProducts(invData || [])
    } catch (err) {
      console.error("Error fetching lounge data:", err)
      toast.error("Failed to load lounge data")
    }
  }

  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) {
      toast.error("Please fill in title and amount")
      return
    }
    if (newExpense.expense_type === 'inventory' && (!newExpense.inventory_product || parseFloat(newExpense.inventory_quantity) <= 0)) {
        toast.error("Please select a product and valid quantity")
        return
    }

    try {
      await createFnbExpense({
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        inventory_product: newExpense.expense_type === 'inventory' ? parseInt(newExpense.inventory_product) : null,
        inventory_quantity: newExpense.expense_type === 'inventory' ? parseFloat(newExpense.inventory_quantity) : 0
      })
      toast.success("Expense recorded")
      setIsAddModalOpen(false)
      setNewExpense({ 
          title: "", 
          amount: "", 
          category: "Operations", 
          expense_type: "normal",
          inventory_product: "",
          inventory_quantity: "0",
          notes: "" 
      })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to record expense")
    }
  }

  const handleUpdateExpense = async () => {
    if (!editingExpense.title || !editingExpense.amount) {
        toast.error("Please fill in title and amount")
        return
    }
    try {
        await updateFnbExpense(editingExpense.id, {
            ...editingExpense,
            amount: parseFloat(editingExpense.amount),
            inventory_product: editingExpense.expense_type === 'inventory' ? parseInt(editingExpense.inventory_product) : null,
            inventory_quantity: editingExpense.expense_type === 'inventory' ? parseFloat(editingExpense.inventory_quantity) : 0
        })
        toast.success("Expense updated")
        setIsEditModalOpen(false)
        setEditingExpense(null)
        fetchData()
    } catch (err: any) {
        toast.error(err.message || "Failed to update expense")
    }
  }

  const handleDeleteExpense = async (id: number) => {
    if (!confirm("Are you sure you want to delete this expense?")) return
    try {
        await deleteFnbExpense(id)
        toast.success("Expense deleted")
        fetchData()
    } catch (err: any) {
        toast.error(err.message || "Failed to delete expense")
    }
  }

  const startEdit = (exp: any) => {
    setEditingExpense({
        ...exp,
        amount: exp.amount.toString(),
        inventory_product: exp.inventory_product?.toString() || "",
        inventory_quantity: exp.inventory_quantity?.toString() || "0"
    })
    setIsEditModalOpen(true)
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col bg-[#0a0a0b] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Lounge Expenses
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase tracking-[0.2em] text-[10px] font-black">FnB Unit</Badge>
                </h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Direct overhead and operational costs</p>
            </div>
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogTrigger asChild>
                    <Button className="bg-amber-500 hover:bg-amber-600 text-black font-black h-12 px-8 rounded-2xl shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]">
                        <Plus className="mr-2 h-4 w-4 stroke-[3]" /> Record Expenditure
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white backdrop-blur-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">Record Lounge Expenditure</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mr-4">Classification Type</Label>
                            <Tabs value={newExpense.expense_type} onValueChange={v => setNewExpense({...newExpense, expense_type: v})} className="w-full">
                                <TabsList className="grid grid-cols-2 w-full h-12 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                    <TabsTrigger value="normal" className="rounded-lg font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black">Operational</TabsTrigger>
                                    <TabsTrigger value="inventory" className="rounded-lg font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black">Stock Purchase</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Record Title</Label>
                            <Input 
                                placeholder={newExpense.expense_type === 'inventory' ? "Batch Purchase Name" : "e.g. Fresh Lemons, Ice Delivery"} 
                                className="bg-black/40 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12 font-bold"
                                value={newExpense.title}
                                onChange={e => setNewExpense({...newExpense, title: e.target.value})}
                            />
                        </div>

                        {newExpense.expense_type === 'inventory' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Target Asset</Label>
                                        <Select 
                                            value={newExpense.inventory_product} 
                                            onValueChange={v => setNewExpense({...newExpense, inventory_product: v})}
                                        >
                                            <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-bold">
                                                <SelectValue placeholder="Product" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                                {inventoryProducts.map(p => (
                                                    <SelectItem key={p.id} value={p.id.toString()} className="font-bold hover:bg-white/5 focus:bg-white/5">{p.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Unit Quantity</Label>
                                        <Input 
                                            type="number" 
                                            className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono"
                                            value={newExpense.inventory_quantity}
                                            onChange={e => setNewExpense({...newExpense, inventory_quantity: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-center gap-4">
                                    <div className="h-3 w-3 rounded-full bg-amber-500 animate-pulse" />
                                    <p className="text-[10px] font-black text-amber-500 leading-tight uppercase tracking-widest">
                                        Automation: Saving will immediately increment {newExpense.inventory_quantity || 0} units to Diva Assets.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Volume Value (ETB)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono"
                                    value={newExpense.amount}
                                    onChange={e => setNewExpense({...newExpense, amount: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Business Logic</Label>
                                <Select 
                                    value={newExpense.category} 
                                    onValueChange={v => setNewExpense({...newExpense, category: v})}
                                >
                                    <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="Operations" className="focus:bg-white/5 font-bold">Operations</SelectItem>
                                        <SelectItem value="Supplies" className="focus:bg-white/5 font-bold">Supplies</SelectItem>
                                        <SelectItem value="Maintenance" className="focus:bg-white/5 font-bold">Maintenance</SelectItem>
                                        <SelectItem value="Other" className="focus:bg-white/5 font-bold">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Transaction Notes</Label>
                            <Textarea 
                                placeholder="Details about this purchase/expense..." 
                                className="bg-black/40 border-white/10 text-white resize-none h-24 rounded-2xl focus:border-amber-500/40 font-medium"
                                value={newExpense.notes}
                                onChange={e => setNewExpense({...newExpense, notes: e.target.value})}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3 pt-4 border-t border-white/5">
                        <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 font-black text-xs uppercase hover:text-white transition-colors">Abort</Button>
                        <Button onClick={handleAddExpense} className="bg-amber-500 text-black font-black px-10 rounded-xl h-12 shadow-xl hover:bg-amber-400 uppercase tracking-widest text-[10px]">Commit Ledger</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <StatCard title="Total Monthly Overhead" value={`ETB ${totalExpenses.toFixed(2)}`} color="text-amber-500" icon={<DollarSign className="h-6 w-6" />} />
            <StatCard title="Total Vouchers" value={expenses.length} color="text-white" icon={<Receipt className="h-6 w-6" />} />
            <StatCard title="Expense Velocity" value="+4.2%" color="text-red-500" icon={<TrendingUp className="h-6 w-6" />} />
        </div>

        <Card className="bg-zinc-900/40 border-white/5 flex-1 min-h-0 flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
            <CardHeader className="shrink-0 border-b border-white/5 bg-black/20 p-6">
                <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Expense Ledger</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                 <ScrollArea className="h-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 sticky top-0 z-10 tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Item / Service</th>
                                <th className="px-8 py-5">Classification</th>
                                <th className="px-8 py-5">Volume Value</th>
                                <th className="px-8 py-5">Execution Date</th>
                                <th className="px-8 py-5">Operator</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {expenses.map((exp: any) => (
                                <tr key={exp.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-3">
                                                <span className="font-black text-white tracking-tight text-base uppercase">{exp.title}</span>
                                                {exp.expense_type === 'inventory' && (
                                                    <Badge className="bg-amber-500 text-black border-none text-[8px] h-4 uppercase tracking-[0.1em] font-black px-2">Stock Event</Badge>
                                                )}
                                            </div>
                                            {exp.notes && <span className="text-[10px] text-zinc-500 mt-1 font-bold uppercase tracking-wider">{exp.notes}</span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className="text-[9px] border-white/10 text-zinc-400 font-black uppercase tracking-widest bg-white/5 px-2.5 py-1">{exp.category}</Badge>
                                    </td>
                                    <td className="px-8 py-6 font-black text-amber-500 text-base">ETB {parseFloat(exp.amount).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-zinc-400 font-bold text-xs">{new Date(exp.date).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-zinc-500 text-xs font-black uppercase tracking-tighter">{exp.employee_name || 'System Auto'}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 text-zinc-500 hover:text-amber-500 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/5"
                                                onClick={() => startEdit(exp)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-9 w-9 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20"
                                                onClick={() => handleDeleteExpense(exp.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr className="border-none">
                                    <td colSpan={6} className="py-32 text-center text-zinc-800 font-black uppercase tracking-[0.4em] text-xs">No entries archived</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                 </ScrollArea>
            </CardContent>
        </Card>

        {/* Edit Expense Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="max-w-md bg-zinc-900 border-white/10 text-white backdrop-blur-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-black tracking-tight text-white uppercase">Update Expenditure</DialogTitle>
                </DialogHeader>
                {editingExpense && (
                    <div className="space-y-6 py-4">
                        <div className="space-y-3">
                            <Label className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mr-4">Classification Type</Label>
                            <Tabs value={editingExpense.expense_type} onValueChange={v => setEditingExpense({...editingExpense, expense_type: v})} className="w-full">
                                <TabsList className="grid grid-cols-2 w-full h-12 bg-black/40 p-1.5 rounded-xl border border-white/5">
                                    <TabsTrigger value="normal" className="rounded-lg font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black">Operational</TabsTrigger>
                                    <TabsTrigger value="inventory" className="rounded-lg font-black text-[10px] uppercase tracking-widest transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-black">Stock Purchase</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Record Title</Label>
                            <Input 
                                placeholder="e.g. Fresh Lemons, Ice Delivery" 
                                className="bg-black/40 border-white/10 text-white focus:border-amber-500/50 focus:ring-amber-500/20 rounded-xl h-12 font-bold"
                                value={editingExpense.title}
                                onChange={e => setEditingExpense({...editingExpense, title: e.target.value})}
                            />
                        </div>

                        {editingExpense.expense_type === 'inventory' && (
                            <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Target Asset</Label>
                                    <Select 
                                        value={editingExpense.inventory_product} 
                                        onValueChange={v => setEditingExpense({...editingExpense, inventory_product: v})}
                                    >
                                        <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-bold">
                                            <SelectValue placeholder="Product" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            {inventoryProducts.map(p => (
                                                <SelectItem key={p.id} value={p.id.toString()} className="focus:bg-white/5 font-bold font-bold hover:bg-white/5 focus:bg-white/5">{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Unit Value</Label>
                                    <Input 
                                        type="number" 
                                        className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono"
                                        value={editingExpense.inventory_quantity}
                                        onChange={e => setEditingExpense({...editingExpense, inventory_quantity: e.target.value})}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Amount (ETB)</Label>
                                <Input 
                                    type="number" 
                                    placeholder="0.00" 
                                    className="bg-black/40 border-white/10 text-white font-black h-12 rounded-xl font-mono"
                                    value={editingExpense.amount}
                                    onChange={e => setEditingExpense({...editingExpense, amount: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Business Logic</Label>
                                <Select 
                                    value={editingExpense.category} 
                                    onValueChange={v => setEditingExpense({...editingExpense, category: v})}
                                >
                                    <SelectTrigger className="bg-black/40 border-white/10 text-white h-12 rounded-xl font-bold">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                        <SelectItem value="Operations" className="focus:bg-white/5 font-bold">Operations</SelectItem>
                                        <SelectItem value="Supplies" className="focus:bg-white/5 font-bold">Supplies</SelectItem>
                                        <SelectItem value="Maintenance" className="focus:bg-white/5 font-bold">Maintenance</SelectItem>
                                        <SelectItem value="Other" className="focus:bg-white/5 font-bold">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Refinement Notes</Label>
                            <Textarea 
                                placeholder="Details about this expense..." 
                                className="bg-black/40 border-white/10 text-white resize-none h-24 rounded-2xl focus:border-amber-500/40 font-medium"
                                value={editingExpense.notes}
                                onChange={e => setEditingExpense({...editingExpense, notes: e.target.value})}
                            />
                        </div>
                    </div>
                )}
                <DialogFooter className="gap-3 pt-4 border-t border-white/5">
                    <Button variant="ghost" onClick={() => setIsEditModalOpen(false)} className="text-zinc-500 font-black text-xs uppercase hover:text-white transition-colors">Abort</Button>
                    <Button onClick={handleUpdateExpense} className="bg-amber-500 text-black font-black px-10 rounded-xl h-12 shadow-xl hover:bg-amber-400 uppercase tracking-widest text-[10px]">Save Modifications</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
  )
}

function StatCard({ title, value, color, icon }: { title: string, value: any, color: string, icon: any }) {
    return (
        <Card className="bg-zinc-900/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden group hover:border-amber-500/20 transition-all backdrop-blur-xl">
            <CardContent className="p-7 flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5", color)}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-1.5">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
