"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Filter,
  ShoppingCart,
  Plus,
  Loader2,
  Clock
} from "lucide-react"
import { financialApi, branchesApi, employeesApi, customersApi } from "@/lib/api"
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
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

interface RevenueHubProps {
  user: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
  }
}

export function RevenueHub({ user }: RevenueHubProps) {
  const isFnb = typeof window !== 'undefined' && localStorage.getItem('business_context') === 'fnb'
  const isAdmin = user.role === "admin"
  const [data, setData] = useState<{ sales: any[], payments: any[], expenses: any[] }>({
    sales: [],
    payments: [],
    expenses: []
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("daily")
  const [branches, setBranches] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
  const [businessFilter, setBusinessFilter] = useState<"all" | "printing" | "fnb">("all")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  
  // Payment recording state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    customerId: "",
    amount: "",
    type: "payment" as "payment" | "charge" | "adjustment",
    paymentMethod: "cash" as "cash" | "transfer",
    bankProvider: "" as string,
    notes: ""
  })

  useEffect(() => {
    fetchData()
    if (isAdmin) {
      fetchBranches()
      fetchEmployees()
      fetchCustomers()
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [selectedBranch, selectedEmployee, startDate, endDate])

  const fetchBranches = async () => {
    try {
      const res = await branchesApi.getAll()
      setBranches(res)
    } catch (err) {
      console.error("Error fetching branches:", err)
    }
  }

  const fetchEmployees = async () => {
    try {
      const res = await employeesApi.getAll({ page_size: 100 })
      setEmployees(res.results || [])
    } catch (err) {
      console.error("Error fetching employees:", err)
    }
  }

  const fetchCustomers = async () => {
    try {
      const res = await customersApi.getListMin()
      setCustomers(res || [])
    } catch (err) {
      console.error("Error fetching customers:", err)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (selectedBranch !== "all") params.branch = selectedBranch
      if (selectedEmployee !== "all") params.employee = selectedEmployee
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate

      const res = await financialApi.getGlobalView(params)
      setData(res)
    } catch (err) {
      console.error("Error fetching financial data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentForm.customerId || !paymentForm.amount) return
    try {
      setPaymentLoading(true)
      await customersApi.addPayment(paymentForm.customerId, {
        amount: paymentForm.amount,
        type: paymentForm.type,
        paymentMethod: paymentForm.type === 'payment' ? paymentForm.paymentMethod : undefined,
        bankProvider: paymentForm.paymentMethod === 'transfer' ? paymentForm.bankProvider : undefined,
        notes: paymentForm.notes
      })
      setIsPaymentModalOpen(false)
      setPaymentForm({
        customerId: "",
        amount: "",
        type: "payment",
        paymentMethod: "cash",
        bankProvider: "",
        notes: ""
      })
      fetchData() // Refresh records
    } catch (err) {
      console.error("Error recording payment:", err)
    } finally {
      setPaymentLoading(false)
    }
  }

  const stats = useMemo(() => {
    const now = new Date()
    
    const filterByTime = (items: any[], dateField: string) => {
      // If manual date range is set, don't apply timeframe filter
      if (startDate || endDate) return items

      return items.filter(item => {
        const itemDate = new Date(item[dateField])
        if (timeframe === "daily") {
          return itemDate.toDateString() === now.toDateString()
        }
        if (timeframe === "weekly") {
          const weekAgo = new Date()
          weekAgo.setDate(now.getDate() - 7)
          return itemDate >= weekAgo
        }
        if (timeframe === "monthly") {
          return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear()
        }
        return true
      })
    }

    const filterByBusiness = (items: any[]) => {
      if (businessFilter === "all") return items
      return items.filter(item => item.business_type === businessFilter)
    }

    const filteredRawSales = filterByBusiness(data.sales)
    const filteredRawPayments = filterByBusiness(data.payments)
    const filteredRawExpenses = filterByBusiness(data.expenses)

    const filteredSalesAndCharges = filterByTime([...filteredRawSales, ...filteredRawPayments.filter(p => p.type === 'charge').map(p => ({...p, timestamp: p.date}))], "timestamp")
    const filteredRecoveriesAndAdjustments = filterByTime(filteredRawPayments.filter(p => p.type === 'payment' || p.type === 'adjustment'), "date")
    const filteredExpenses = filterByTime(filteredRawExpenses, "date")

    const totalIncome = filteredRecoveriesAndAdjustments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    
    // Total Billed Sales
    const totalSalesAmount = filteredSalesAndCharges.reduce((sum, s) => sum + parseFloat(s.total_amount || s.amount), 0)
    const totalSalesCount = filteredSalesAndCharges.length

    // Debt (Charges) = Unpaid sales + Task completions
    const totalDebt = (filteredRawPayments.filter(p => p.type === 'charge')).reduce((sum, p) => sum + parseFloat(p.amount), 0)

    return {
      revenue: totalIncome,
      debt: totalDebt,
      expenses: totalExpenses,
      salesAmount: totalSalesAmount,
      salesCount: totalSalesCount,
      netByCash: totalIncome - totalExpenses,
      estimatedProfit: totalSalesAmount - totalExpenses, // Sales - Expenses
      cashInCount: filteredRecoveriesAndAdjustments.length
    }
  }, [data, timeframe, businessFilter, startDate, endDate])

  const exportData = () => {
    const rows = [
      ["Type", "Entity", "Amount", "Date", "Notes"],
      ...data.sales.map(s => ["Sale", s.customer_name, s.total_amount, s.timestamp, s.notes]),
      ...data.payments.map(p => ["Payment", p.customer_name || "N/A", p.amount, p.date, p.notes]),
      ...data.expenses.map(e => ["Expense", e.title, e.amount, e.date, e.notes])
    ]
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n")
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    const rangeTag = startDate || endDate ? `${startDate || 'start'}_to_${endDate || 'end'}` : timeframe
    const fileName = `financial_report_${rangeTag}_${new Date().toISOString().split('T')[0]}.csv`
    link.setAttribute("download", fileName)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const [txTypeFilter, setTxTypeFilter] = useState<"all" | "Sale" | "Payment" | "Expense" | "Adjustment">("all")

  return (
    <div className={cn("flex flex-col gap-6 p-1", isFnb && "bg-[#0a0a0b] text-white")}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className={cn("text-3xl font-black tracking-tighter uppercase italic", isFnb ? "text-white" : "text-foreground")}>Financial Insights</h1>
          <p className={cn("text-xs uppercase font-black tracking-[0.3em] mt-1", isFnb ? "text-zinc-500" : "text-muted-foreground")}>
            {startDate || endDate ? "Custom Range" : timeframe} performance Overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <div className="flex items-center gap-2">
                <Select value={businessFilter} onValueChange={(v: any) => setBusinessFilter(v)}>
                  <SelectTrigger className={cn(
                    "w-[180px] h-10 font-bold rounded-xl transition-all",
                    isFnb ? "bg-white/5 border-white/5 text-white focus:border-amber-500/30" : "border-amber-500/20 bg-amber-500/5"
                  )}>
                    <SelectValue placeholder="Unified View" />
                  </SelectTrigger>
                  <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                    <SelectItem value="all" className={isFnb ? "focus:bg-white/5" : ""}>Unified View</SelectItem>
                    <SelectItem value="printing" className={isFnb ? "focus:bg-white/5" : ""}>MasePrinting Hub</SelectItem>
                    <SelectItem value="fnb" className={isFnb ? "focus:bg-white/5" : ""}>Diva Lounge Addis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className={cn("w-[160px] h-10 font-bold rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className={cn("w-[160px] h-10 font-bold rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                    <SelectItem value="all">All Staff</SelectItem>
                    {employees.map(e => (
                      <SelectItem key={e.id} value={e.id.toString()}>{e.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <Input 
              type="date" 
              className={cn("w-36 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white" : "")} 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-zinc-500 font-black text-[10px] uppercase">to</span>
            <Input 
              type="date" 
              className={cn("w-36 h-10 text-[10px] font-black uppercase tracking-widest rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white" : "")} 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate || selectedBranch !== "all" || selectedEmployee !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setSelectedBranch("all"); setSelectedEmployee("all"); }} className="h-10 text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 hover:bg-red-500/5">
              Reset
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportData} className={cn("gap-2 h-10 px-5 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all", isFnb ? "bg-white/5 border-white/5 text-white hover:bg-white/10" : "")}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => setIsPaymentModalOpen(true)} className={cn("gap-2 h-10 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl shadow-xl transition-all", isFnb ? "bg-amber-500 text-black hover:bg-amber-400" : "bg-primary text-primary-foreground")}>
             <Plus className="h-4 w-4" /> Record Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Billed Sales Card */}
        <Card className={cn(
          "shadow-2xl transition-all rounded-2xl border-white/5",
          isFnb ? "bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-blue-500/50" : "shadow-sm border-l-4 border-l-blue-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-[10px] uppercase font-black tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Billed Sales</CardTitle>
            <ShoppingCart className={cn("h-4 w-4", isFnb ? "text-blue-400" : "text-blue-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-black tracking-tighter", isFnb ? "text-white" : "font-bold")}>
              <span className="text-xs mr-1 opacity-50">$</span>{stats.salesAmount.toLocaleString()}
            </div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isFnb ? "text-zinc-600" : "text-xs text-muted-foreground")}>
              {stats.salesCount} total transactions
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "shadow-2xl transition-all rounded-2xl border-white/5",
          isFnb ? "bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-emerald-500/50" : "shadow-sm border-l-4 border-l-emerald-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-[10px] uppercase font-black tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Cash Collected</CardTitle>
            <DollarSign className={cn("h-4 w-4", isFnb ? "text-emerald-400" : "text-emerald-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-black tracking-tighter", isFnb ? "text-white" : "font-bold")}>
              <span className="text-xs mr-1 opacity-50">$</span>{stats.revenue.toLocaleString()}
            </div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isFnb ? "text-zinc-600" : "text-xs text-muted-foreground")}>
              From {stats.cashInCount} receipts
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn(
          "shadow-2xl transition-all rounded-2xl border-white/5",
          isFnb ? "bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-rose-500/50" : "shadow-sm border-l-4 border-l-rose-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-[10px] uppercase font-black tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Operating Opex</CardTitle>
            <ArrowDownRight className={cn("h-4 w-4", isFnb ? "text-rose-400" : "text-red-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-black tracking-tighter", isFnb ? "text-white" : "font-bold")}>
              <span className="text-xs mr-1 opacity-50">$</span>{stats.expenses.toLocaleString()}
            </div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isFnb ? "text-zinc-600" : "text-xs text-muted-foreground")}>
              All overhead costs
            </p>
          </CardContent>
        </Card>

        <Card className={cn(
          "shadow-2xl transition-all rounded-2xl border-white/5",
          isFnb ? "bg-zinc-900/40 backdrop-blur-xl border-l-4 border-l-amber-500/50" : "shadow-sm border-l-4 border-l-amber-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn("text-[10px] uppercase font-black tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Outstanding Debt</CardTitle>
            <Clock className={cn("h-4 w-4", isFnb ? "text-amber-400" : "text-amber-500")} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-black tracking-tighter", isFnb ? "text-white" : "font-bold")}>
              <span className="text-xs mr-1 opacity-50">$</span>{stats.debt.toLocaleString()}
            </div>
            <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isFnb ? "text-zinc-600" : "text-xs text-muted-foreground")}>
              Unpaid customer orders
            </p>
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className={cn(
          "shadow-2xl transition-all rounded-2xl border-white/5",
          isFnb 
            ? "bg-amber-500/10 backdrop-blur-xl border-l-4 border-l-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.1)]" 
            : "shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/10"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className={cn(
              "text-[10px] uppercase font-black tracking-[0.2em]", 
              isFnb ? "text-amber-500/80" : "text-sm font-bold text-indigo-900"
            )}>Est. Profit</CardTitle>
            <TrendingUp className={cn(
              "h-4 w-4", 
              isFnb ? "text-amber-500" : (stats.estimatedProfit >= 0 ? "text-indigo-600" : "text-rose-600")
            )} />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-black tracking-tighter", 
              isFnb ? "text-amber-500" : "text-indigo-900"
            )}>
              <span className="text-xs mr-1 opacity-50">$</span>{stats.estimatedProfit.toLocaleString()}
            </div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-tighter mt-1", 
              isFnb ? "text-amber-500/40" : "text-indigo-400"
            )}>
               Sales - Operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full" onValueChange={(v) => setTimeframe(v as any)}>
        <TabsList className={cn(
          "grid w-full max-w-[400px] grid-cols-3 p-1 rounded-xl mb-6",
          isFnb ? "bg-white/5" : "bg-muted/50"
        )}>
          <TabsTrigger value="daily" className={cn("rounded-lg font-black text-[10px] uppercase tracking-widest", isFnb && "data-[state=active]:bg-amber-500 data-[state=active]:text-black")}>Daily</TabsTrigger>
          <TabsTrigger value="weekly" className={cn("rounded-lg font-black text-[10px] uppercase tracking-widest", isFnb && "data-[state=active]:bg-amber-500 data-[state=active]:text-black")}>Weekly</TabsTrigger>
          <TabsTrigger value="monthly" className={cn("rounded-lg font-black text-[10px] uppercase tracking-widest", isFnb && "data-[state=active]:bg-amber-500 data-[state=active]:text-black")}>Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="mt-0 space-y-6">
          <Card className={cn(
            "shadow-2xl rounded-2xl border-white/5 overflow-hidden",
            isFnb ? "bg-zinc-900/40 backdrop-blur-xl" : "shadow-sm"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-white/5">
              <div className="space-y-1">
                <CardTitle className={cn("text-xl font-black tracking-tighter uppercase", isFnb && "text-white")}>Transaction Ledger</CardTitle>
                <CardDescription className={cn("text-[10px] font-bold uppercase tracking-widest", isFnb ? "text-zinc-500" : "")}>Comprehensive audit of all financial events</CardDescription>
              </div>
              <div className="flex gap-3">
                <Select value={txTypeFilter} onValueChange={(v: any) => setTxTypeFilter(v)}>
                  <SelectTrigger className={cn("w-[160px] h-9 text-[10px] font-black uppercase tracking-widest rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white" : "text-xs")}>
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Sale">Sales Log</SelectItem>
                    <SelectItem value="Payment">Payments & Collections</SelectItem>
                    <SelectItem value="Expense">Expenses Only</SelectItem>
                    <SelectItem value="Adjustment">Adjustments</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className={cn("h-9 font-black text-[10px] uppercase tracking-widest rounded-xl px-4", isFnb ? "bg-white/5 border-white/5 text-white hover:bg-white/10" : "")}>
                  <Calendar className="mr-2 h-3.5 w-3.5" /> Date
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className={cn("hover:bg-transparent", isFnb ? "border-white/5" : "")}>
                    <TableHead className={cn("font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Type</TableHead>
                    <TableHead className={cn("font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Description</TableHead>
                    <TableHead className={cn("font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Entity / Responsible</TableHead>
                    <TableHead className={cn("font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Amount</TableHead>
                    <TableHead className={cn("font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Category</TableHead>
                    <TableHead className={cn("text-right font-black text-[10px] uppercase tracking-widest py-4", isFnb && "text-zinc-500")}>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ...data.sales.map(s => ({ ...s, txType: 'Sale', desc: s.customer_name, responsible: s.employee_name || 'System', cat: 'Retail Charge', amt: s.total_amount, ts: s.timestamp })),
                    ...data.payments.map(p => {
                      const bankLabels: Record<string, string> = { telebirr: 'Tele Birr', cbe: 'CBE', awash: 'Awash', abyssinia: 'Abyssinia' }
                      const catLabel = p.paymentMethod === 'transfer' && p.bankProvider
                        ? `Transfer via ${bankLabels[p.bankProvider] || p.bankProvider}`
                        : p.paymentMethod 
                          ? (p.paymentMethod.charAt(0).toUpperCase() + p.paymentMethod.slice(1)) 
                          : (p.type === 'charge' ? 'Unpaid' : 'Correction')
                      return { 
                        ...p, 
                        txType: p.type === 'adjustment' ? 'Adjustment' : 'Payment', 
                        desc: `From ${p.customer_name || "Customer"}`, 
                        responsible: p.recorded_by_name || 'Admin', 
                        cat: catLabel, 
                        amt: p.amount, 
                        ts: p.date 
                      }
                    })
                    .filter(p => p.type !== 'charge'),
                    ...data.expenses.map(e => ({ ...e, txType: 'Expense', desc: e.title, responsible: 'Operations', cat: e.category, amt: e.amount, ts: e.date }))
                  ]
                    .filter(tx => {
                      // Filter by business type
                      if (businessFilter !== "all" && tx.business_type && tx.business_type !== businessFilter) return false

                      // Filter by type
                      if (txTypeFilter !== "all" && tx.txType !== txTypeFilter) return false

                      // If custom range is active, ledger filtering by timeframe is bypassed (handled by backend)
                      if (startDate || endDate) return true

                      const txDate = new Date(tx.ts)
                      const now = new Date()
                      if (timeframe === 'daily') return txDate.toDateString() === now.toDateString()
                      if (timeframe === 'weekly') {
                        const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7); return txDate >= weekAgo
                      }
                      if (timeframe === 'monthly') return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear()
                      return true
                    })
                    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
                    .map((tx, idx) => (
                      <TableRow key={idx} className={cn(
                        "transition-all duration-200",
                        isFnb ? "border-white/5 hover:bg-white/5" : "hover:bg-muted/50"
                      )}>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 py-1">
                            <Badge className={cn(
                              "font-black uppercase text-[9px] tracking-widest w-fit rounded-md px-2 py-0.5 border-none",
                              tx.txType === 'Expense' ? "bg-red-500/10 text-red-500" : (isFnb ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500")
                            )}>
                              {tx.txType}
                            </Badge>
                            {tx.business_type && (
                              <Badge variant="secondary" className={cn(
                                "text-[8px] uppercase px-1.5 py-0 w-fit border-none font-black tracking-tighter opacity-80",
                                tx.business_type === 'fnb' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                              )}>
                                {tx.business_type === 'fnb' ? 'Lounge' : 'Printing'}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className={cn("text-xs font-black tracking-tight", isFnb ? "text-white" : "font-medium")}>{tx.desc}</TableCell>
                        <TableCell className={cn("text-[10px] font-bold uppercase tracking-widest", isFnb ? "text-zinc-500" : "text-muted-foreground")}>{tx.responsible}</TableCell>
                        <TableCell className={cn(
                          "font-black text-sm tracking-tighter",
                          tx.txType === 'Expense' ? "text-red-500" : (isFnb ? "text-amber-500" : "text-emerald-500")
                        )}>
                          {tx.txType === 'Expense' ? "-" : "+"}${parseFloat(tx.amt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-[10px] font-bold uppercase tracking-widest", isFnb ? "text-zinc-500" : "text-muted-foreground")}>{tx.cat}</span>
                        </TableCell>
                        <TableCell className={cn("text-right text-[10px] font-black uppercase tracking-widest", isFnb ? "text-zinc-500" : "text-muted-foreground")}>
                          {new Date(tx.ts).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className={cn(
          "sm:max-w-[425px] rounded-3xl border-white/10 p-6 overflow-hidden",
          isFnb ? "bg-[#0a0a0b] text-white backdrop-blur-2xl" : ""
        )}>
          <DialogHeader>
            <DialogTitle className={cn("text-xl font-black tracking-tighter uppercase italic", isFnb && "text-white")}>Record Financial Entry</DialogTitle>
            <CardDescription className={cn("text-[10px] font-bold uppercase tracking-widest mt-1", isFnb ? "text-zinc-500" : "")}>Add a new payment or charge to the ledger</CardDescription>
          </DialogHeader>
          <div className="grid gap-5 py-6">
            <div className="grid gap-2">
              <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Customer</Label>
              <Select value={paymentForm.customerId} onValueChange={(v) => setPaymentForm({...paymentForm, customerId: v})}>
                <SelectTrigger className={cn("h-11 font-bold rounded-xl transition-all", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                  {customers.map(c => (
                    <SelectItem key={c.customer_id} value={c.customer_id.toString()} className={isFnb ? "focus:bg-white/5" : ""}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Transaction Type</Label>
              <Select value={paymentForm.type} onValueChange={(v: any) => setPaymentForm({...paymentForm, type: v, paymentMethod: v === 'payment' ? 'cash' : (v === 'adjustment' ? 'cash' : paymentForm.paymentMethod)})}>
                <SelectTrigger className={cn("h-11 font-bold rounded-xl transition-all", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                  <SelectItem value="payment" className={isFnb ? "focus:bg-white/5 text-emerald-400" : ""}>Payment (Cash In)</SelectItem>
                  <SelectItem value="charge" className={isFnb ? "focus:bg-white/5 text-blue-400" : ""}>Charge (Debt Up)</SelectItem>
                  <SelectItem value="adjustment" className={isFnb ? "focus:bg-white/5 text-amber-400" : ""}>Balance Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Amount ($)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={paymentForm.amount} 
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} 
                placeholder="0.00" 
                className={cn("h-11 font-black text-lg tracking-tighter rounded-xl", isFnb ? "bg-white/5 border-white/5 text-white placeholder:text-zinc-700" : "")}
              />
            </div>
             {paymentForm.type === "payment" && (
                <>
                  <div className="grid gap-2">
                    <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Payment Method</Label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(v: any) => setPaymentForm({...paymentForm, paymentMethod: v, bankProvider: v === 'cash' ? '' : paymentForm.bankProvider})}>
                      <SelectTrigger className={cn("h-11 font-bold rounded-xl transition-all", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentForm.paymentMethod === "transfer" && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                      <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Bank / Provider</Label>
                      <Select value={paymentForm.bankProvider} onValueChange={(v) => setPaymentForm({...paymentForm, bankProvider: v})}>
                        <SelectTrigger className={cn("h-11 font-bold rounded-xl transition-all", isFnb ? "bg-white/5 border-white/5 text-white" : "")}>
                          <SelectValue placeholder="Select bank" />
                        </SelectTrigger>
                        <SelectContent className={isFnb ? "bg-zinc-900 border-white/10 text-white" : ""}>
                          <SelectItem value="telebirr">Tele Birr</SelectItem>
                          <SelectItem value="cbe">CBE</SelectItem>
                          <SelectItem value="awash">Awash</SelectItem>
                          <SelectItem value="abyssinia">Abyssinia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
             )}
            <div className="grid gap-2">
              <Label className={cn("text-[10px] font-black uppercase tracking-[0.2em]", isFnb ? "text-zinc-500" : "text-sm font-medium")}>Notes</Label>
              <Textarea 
                value={paymentForm.notes} 
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} 
                placeholder="Entry details..." 
                className={cn("min-h-[80px] font-medium rounded-xl resize-none", isFnb ? "bg-white/5 border-white/5 text-white placeholder:text-zinc-700" : "")}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="ghost" onClick={() => setIsPaymentModalOpen(false)} className={cn("h-11 px-6 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/5", isFnb ? "text-zinc-500 hover:text-white" : "")}>Cancel</Button>
             <Button onClick={handleRecordPayment} disabled={paymentLoading || !paymentForm.customerId || !paymentForm.amount} className={cn("h-11 px-8 font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-xl transition-all", isFnb ? "bg-amber-500 text-black hover:bg-amber-400" : "")}>
               {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
               Save Record
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
