"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  Calendar,
  AlertTriangle,
  DollarSign,
  History,
  CreditCard,
  Clock,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogTrigger,
    DialogDescription
} from "@/components/ui/dialog"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { customersApi } from "@/lib/api"
import { toast } from "sonner"

export function LoungeCustomers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [totalDebt, setTotalDebt] = useState(0)
  const [totalCredit, setTotalCredit] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customerHistory, setCustomerHistory] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    business_type: "fnb"
  })

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    type: "payment" as "payment" | "charge",
    notes: "",
    paymentMethod: "cash" as "cash" | "transfer",
    bankProvider: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const data = await customersApi.getAll({ business_type: 'fnb' }) as any
      setCustomers(data.results || [])
      setTotalDebt(data.system_total_debt || 0)
      setTotalCredit(data.system_total_credit || 0)
    } catch (err) {
      console.error("Error fetching customers:", err)
      toast.error("Failed to load bar customers")
    }
  }

  const handleAddCustomer = async () => {
    if (!newCustomer.name) {
      toast.error("Please fill in the customer name")
      return
    }
    try {
      await customersApi.create(newCustomer)
      toast.success("Customer registered")
      setIsAddModalOpen(false)
      setNewCustomer({ name: "", email: "", phone: "", business_type: "fnb" })
      fetchData()
    } catch (err: any) {
      toast.error(err.message || "Failed to register customer")
    }
  }

  const handleOpenPayment = (customer: any) => {
    setSelectedCustomer(customer)
    setPaymentForm({
        amount: "",
        type: "payment",
        notes: "",
        paymentMethod: "cash",
        bankProvider: ""
    })
    setIsPaymentModalOpen(true)
  }

  const handleOpenHistory = async (customer: any) => {
    setSelectedCustomer(customer)
    setIsHistoryModalOpen(true)
    setIsLoading(true)
    try {
        const history = await customersApi.getPayments(customer.id)
        setCustomerHistory(Array.isArray(history) ? history : [])
    } catch (err) {
        toast.error("Failed to load history")
    } finally {
        setIsLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentForm.amount || parseFloat(paymentForm.amount) <= 0) {
        toast.error("Please enter a valid amount")
        return
    }
    
    setIsLoading(true)
    try {
        await customersApi.addPayment(selectedCustomer.id, {
            amount: paymentForm.amount,
            type: paymentForm.type,
            notes: paymentForm.notes,
            paymentMethod: paymentForm.type === 'payment' ? paymentForm.paymentMethod : undefined,
            bankProvider: paymentForm.paymentMethod === 'transfer' ? paymentForm.bankProvider : undefined
        })
        toast.success("Transaction recorded")
        setIsPaymentModalOpen(false)
        fetchData()
    } catch (err: any) {
        toast.error(err.message || "Failed to record transaction")
    } finally {
        setIsLoading(false)
    }
  }

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  )

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col bg-[#0a0a0b] text-white">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Bar Registry
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase tracking-[0.2em] text-[10px] font-black">Audit Mode</Badge>
                </h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">High-fidelity client tracking and debt ledger</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                        placeholder="Search Registry..." 
                        className="pl-11 h-12 bg-zinc-900/40 border-white/5 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-2xl font-bold transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-black h-12 px-8 rounded-2xl shadow-2xl shadow-amber-500/20 active:scale-[0.98] transition-all uppercase tracking-widest text-[11px]">
                            <UserPlus className="mr-2 h-4 w-4 stroke-[3]" /> Register Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md bg-[#0a0a0b] border-white/5 text-white backdrop-blur-3xl p-8 rounded-[2rem]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">New Membership</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Legal Name</Label>
                                <Input 
                                    placeholder="Full Name" 
                                    className="bg-white/5 border-white/5 text-white h-14 rounded-2xl font-bold focus:border-amber-500/30 transition-all px-5"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Contact Email</Label>
                                <Input 
                                    type="email" 
                                    placeholder="client@diva.com" 
                                    className="bg-white/5 border-white/5 text-white h-14 rounded-2xl font-bold focus:border-amber-500/30 transition-all px-5"
                                    value={newCustomer.email}
                                    onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Phone Signal</Label>
                                <Input 
                                    placeholder="+251..." 
                                    className="bg-white/5 border-white/5 text-white h-14 rounded-2xl font-bold focus:border-amber-500/30 transition-all px-5"
                                    value={newCustomer.phone}
                                    onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                                />
                            </div>
                        </div>
                        <DialogFooter className="gap-4 pt-6 border-t border-white/5">
                            <Button variant="ghost" onClick={() => setIsAddModalOpen(false)} className="text-zinc-500 font-black text-xs uppercase hover:text-white transition-all h-12">Cancel</Button>
                            <Button onClick={handleAddCustomer} className="bg-amber-500 text-black font-black px-12 rounded-2xl h-12 shadow-xl hover:bg-amber-400 uppercase tracking-widest text-[10px]">Initialize Profile</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <StatCard title="Total Registrations" value={customers.length} color="text-white" icon={<Users className="h-6 w-6" />} />
            <StatCard title="Outstanding Receivables" value={`ETB ${totalDebt.toLocaleString()}`} color="text-red-500" icon={<AlertTriangle className="h-6 w-6" />} />
            <StatCard title="Aggregate Credit" value={`ETB ${totalCredit.toLocaleString()}`} color="text-emerald-500" icon={<Calendar className="h-6 w-6" />} />
        </div>

        {/* Client Table */}
        <Card className="bg-zinc-900/40 border-white/5 flex-1 min-h-0 flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
            <CardHeader className="shrink-0 border-b border-white/5 bg-black/20 flex flex-row items-center justify-between p-6">
                <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Client Registry</CardTitle>
                <Badge variant="outline" className="text-[10px] font-black uppercase tracking-[0.3em] border-amber-500/20 text-amber-500 bg-amber-500/5 px-4 py-1.5">{filteredCustomers.length} Verified Records</Badge>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                 <ScrollArea className="h-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase font-black text-zinc-500 sticky top-0 z-10 tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5">Client Profile</th>
                                <th className="px-8 py-5">Ledger Balance</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredCustomers.map((c: any) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-11 w-11 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-amber-500 font-black text-xs uppercase shadow-inner group-hover:scale-110 transition-transform">
                                                {c.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-black text-white tracking-tight text-base uppercase">{c.name}</span>
                                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{c.phone || 'NO SIGNAL'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className={cn(
                                            "font-black tracking-tight text-lg",
                                            parseFloat(c.balance) < 0 ? "text-red-500" : parseFloat(c.balance) > 0 ? "text-emerald-500" : "text-zinc-500"
                                        )}>
                                            <span className="text-xs mr-1 opacity-50">ETB</span> {Math.abs(parseFloat(c.balance)).toLocaleString()}
                                            {parseFloat(c.balance) < 0 ? <span className="text-[10px] ml-2 uppercase font-black tracking-widest opacity-40">DEBT</span> : parseFloat(c.balance) > 0 ? <span className="text-[10px] ml-2 uppercase font-black tracking-widest opacity-40">CREDIT</span> : ''}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <Badge variant="outline" className={cn(
                                            "px-3 py-1 font-black text-[9px] uppercase tracking-widest",
                                            parseFloat(c.balance) < 0 ? "border-red-500/20 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]" : "border-emerald-500/20 text-emerald-500 bg-emerald-500/5"
                                        )}>
                                            {parseFloat(c.balance) < 0 ? "Receivable Due" : "Clear Balance"}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="h-9 border-white/5 bg-white/5 hover:bg-amber-500 hover:text-black font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                                                onClick={() => handleOpenPayment(c)}
                                            >
                                                <DollarSign className="h-3 w-3 mr-2" /> Record
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="h-9 text-zinc-500 hover:text-white font-black text-[10px] uppercase tracking-widest hover:bg-white/5 rounded-xl transition-all"
                                                onClick={() => handleOpenHistory(c)}
                                            >
                                                <History className="h-3 w-3 mr-2" /> Audit
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </ScrollArea>
            </CardContent>
        </Card>

        {/* Record Transaction Modal */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
            <DialogContent className="max-w-md bg-[#0a0a0b] border-white/5 text-white backdrop-blur-3xl p-8 rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black tracking-tighter text-white uppercase italic">Ledger Entry</DialogTitle>
                    <DialogDescription className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-2">
                        Adjusting balance for <span className="text-amber-500">{selectedCustomer?.name}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Operation Type</Label>
                            <Select value={paymentForm.type} onValueChange={(v: any) => setPaymentForm({...paymentForm, type: v})}>
                                <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-2xl font-black px-5 focus:border-amber-500/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="payment" className="font-bold hover:bg-white/5 focus:bg-white/5">Payment (Cash In)</SelectItem>
                                    <SelectItem value="charge" className="font-bold hover:bg-white/5 focus:bg-white/5">Charge (Record Debt)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Value (ETB)</Label>
                            <Input 
                                type="number" 
                                className="bg-white/5 border-white/5 h-14 rounded-2xl font-black px-5 focus:border-amber-500/30 font-mono"
                                value={paymentForm.amount}
                                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                            />
                        </div>
                    </div>

                    {paymentForm.type === 'payment' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="space-y-3">
                                <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Settlement Method</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <Button 
                                        variant="outline"
                                        className={cn(
                                            "h-14 font-black rounded-2xl transition-all border-white/5 active:scale-95 uppercase tracking-widest text-[10px]",
                                            paymentForm.paymentMethod === 'cash' ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-white/5 text-zinc-500"
                                        )}
                                        onClick={() => setPaymentForm({...paymentForm, paymentMethod: 'cash', bankProvider: ''})}
                                    >
                                        <CreditCard className="mr-3 h-4 w-4" /> Physical Cash
                                    </Button>
                                    <Button 
                                        variant="outline"
                                        className={cn(
                                            "h-14 font-black rounded-2xl transition-all border-white/5 active:scale-95 uppercase tracking-widest text-[10px]",
                                            paymentForm.paymentMethod === 'transfer' ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]" : "bg-white/5 text-zinc-500"
                                        )}
                                        onClick={() => setPaymentForm({...paymentForm, paymentMethod: 'transfer'})}
                                    >
                                        <History className="mr-3 h-4 w-4" /> Digital Wire
                                    </Button>
                                </div>
                            </div>

                            {paymentForm.paymentMethod === 'transfer' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Terminal Provider</Label>
                                    <Select value={paymentForm.bankProvider} onValueChange={v => setPaymentForm({...paymentForm, bankProvider: v})}>
                                        <SelectTrigger className="bg-white/5 border-white/5 h-14 rounded-2xl font-black px-5 focus:border-amber-500/30">
                                            <SelectValue placeholder="Select Gateway" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                            <SelectItem value="telebirr" className="font-bold hover:bg-white/5 focus:bg-white/5">Tele Birr</SelectItem>
                                            <SelectItem value="cbe" className="font-bold hover:bg-white/5 focus:bg-white/5">Commercial Bank (CBE)</SelectItem>
                                            <SelectItem value="awash" className="font-bold hover:bg-white/5 focus:bg-white/5">Awash Bank</SelectItem>
                                            <SelectItem value="abyssinia" className="font-bold hover:bg-white/5 focus:bg-white/5">Abyssinia Bank</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label className="text-[10px] uppercase font-black tracking-widest text-zinc-500">Audit Notes</Label>
                        <Input 
                            placeholder="Optional metadata..." 
                            className="bg-white/5 border-white/5 h-14 rounded-2xl font-bold px-5 focus:border-amber-500/30"
                            value={paymentForm.notes}
                            onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-4 pt-6 border-t border-white/5">
                    <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className="text-zinc-500 font-black text-xs uppercase hover:text-white transition-all h-12">Cancel</Button>
                    <Button 
                        onClick={handleRecordPayment} 
                        disabled={isLoading}
                        className="bg-amber-500 text-black font-black px-12 rounded-2xl h-12 shadow-xl hover:bg-amber-400 uppercase tracking-widest text-[10px]"
                    >
                        {isLoading ? "Executing..." : "Commit Transaction"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Temporal History Modal */}
        <Dialog open={isHistoryModalOpen} onOpenChange={setIsHistoryModalOpen}>
            <DialogContent className="max-w-3xl bg-[#0a0a0b] border-white/5 text-white backdrop-blur-3xl p-0 overflow-hidden rounded-[2.5rem]">
                <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-4">
                            <Clock className="h-7 w-7 text-amber-500" /> Temporal Audit
                        </DialogTitle>
                        <DialogDescription className="text-xs font-black text-zinc-500 uppercase tracking-[0.3em] mt-2">
                            Transaction Stream for <span className="text-white">{selectedCustomer?.name}</span>
                        </DialogDescription>
                    </DialogHeader>
                </div>
                
                <div className="p-10 h-[500px]">
                    <ScrollArea className="h-full pr-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-4 text-zinc-500">
                                <div className="h-10 w-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                                <span className="font-black uppercase tracking-[0.4em] text-[10px]">Synchronizing Secure Ledger...</span>
                            </div>
                        ) : customerHistory.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-zinc-800 opacity-50">
                                <History className="h-16 w-16 mb-6 stroke-[1]" />
                                <span className="font-black uppercase tracking-[0.5em] text-xs">Zero historical events detected</span>
                            </div>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-[10px] uppercase font-black text-zinc-600 tracking-[0.3em] pb-6">
                                    <tr className="border-b border-white/5">
                                        <th className="pb-6">Date of Record</th>
                                        <th className="pb-6 text-center">Operation</th>
                                        <th className="pb-6 text-right">Magnitude</th>
                                        <th className="pb-6 pl-10">Audit Intelligence</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {customerHistory.map((p) => (
                                        <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                                            <td className="py-6 text-xs font-black text-zinc-400 uppercase tracking-tighter">
                                                {new Date(p.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </td>
                                            <td className="py-6 text-center">
                                                <Badge variant="outline" className={cn(
                                                    "px-3 py-1 font-black text-[9px] uppercase tracking-widest",
                                                    p.type === 'payment' ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-red-500/20 text-red-500 bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                                                )}>
                                                    {p.type === 'payment' ? 'Credit In' : 'Debit Out'}
                                                </Badge>
                                            </td>
                                            <td className={cn(
                                                "py-6 text-right font-mono font-black text-lg tracking-tighter",
                                                p.type === 'payment' ? "text-emerald-500" : "text-red-500"
                                            )}>
                                                {p.type === 'payment' ? '+' : '-'} <span className="text-xs mr-1 opacity-50 font-sans">ETB</span>{parseFloat(p.amount).toLocaleString()}
                                            </td>
                                            <td className="py-6 pl-10">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[11px] font-black text-white uppercase tracking-tight leading-tight">{p.notes || 'Automated Internal Record'}</span>
                                                    {(p as any).paymentMethod && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-1 w-1 rounded-full bg-zinc-700" />
                                                            <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">
                                                                Gateway: {(p as any).bankProvider ? (p as any).bankProvider : (p as any).paymentMethod}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </ScrollArea>
                </div>
                <div className="p-10 border-t border-white/5 bg-black">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsHistoryModalOpen(false)} 
                        className="w-full font-black text-[11px] uppercase tracking-[0.4em] text-zinc-500 hover:text-white hover:bg-white/5 h-14 rounded-2xl transition-all"
                    >
                        Terminate Audit
                    </Button>
                </div>
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
