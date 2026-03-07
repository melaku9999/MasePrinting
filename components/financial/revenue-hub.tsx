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
  const isAdmin = user.role === "admin"
  const [data, setData] = useState<{ sales: any[], payments: any[], expenses: any[] }>({
    sales: [],
    payments: [],
    expenses: []
  })
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"daily" | "weekly" | "monthly">("monthly")
  const [branches, setBranches] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedBranch, setSelectedBranch] = useState<string>("all")
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")
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

    const filteredSalesAndCharges = filterByTime([...data.sales, ...data.payments.filter(p => p.type === 'charge').map(p => ({...p, timestamp: p.date}))], "timestamp")
    const filteredRecoveriesAndAdjustments = filterByTime(data.payments.filter(p => p.type === 'payment' || p.type === 'adjustment'), "date")
    const filteredExpenses = filterByTime(data.expenses, "date")

    const totalIncome = filteredRecoveriesAndAdjustments.reduce((sum, p) => sum + parseFloat(p.amount), 0)
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0)
    
    // Total Billed Sales
    const totalSalesAmount = data.sales.reduce((sum, s) => sum + parseFloat(s.total_amount), 0)
    const totalSalesCount = data.sales.length

    // Debt (Charges) = Unpaid sales + Task completions
    const totalDebt = (data.payments.filter(p => p.type === 'charge')).reduce((sum, p) => sum + parseFloat(p.amount), 0)

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
  }, [data, timeframe])

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
    <div className="flex flex-col gap-6 p-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Insights</h1>
          <p className="text-muted-foreground text-sm uppercase font-medium tracking-wide">
            {startDate || endDate ? "Custom Range" : timeframe} performance Overview
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin && (
            <>
              <div className="flex items-center gap-2">
                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="All Branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Branches</SelectItem>
                    {branches.map(b => (
                      <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                  <SelectTrigger className="w-[160px] h-9">
                    <SelectValue placeholder="All Staff" />
                  </SelectTrigger>
                  <SelectContent>
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
              className="w-34 h-9 text-xs" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-muted-foreground">to</span>
            <Input 
              type="date" 
              className="w-34 h-9 text-xs" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          {(startDate || endDate || selectedBranch !== "all" || selectedEmployee !== "all") && (
            <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate(""); setSelectedBranch("all"); setSelectedEmployee("all"); }} className="h-9 text-xs text-red-500 hover:text-red-700">
              Clear
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={exportData} className="gap-2 h-9 px-4 ml-auto md:ml-0">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={() => setIsPaymentModalOpen(true)} className="gap-2 h-9 px-4 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90">
             <Plus className="h-4 w-4" /> Record Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* New Total Sales Card */}
        <Card className="shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Billed Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.salesAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.salesCount} total transactions
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.revenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From {stats.cashInCount} receipts
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm border-l-4 border-l-rose-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Operating Opex</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.expenses.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All overhead costs
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Debt</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.debt.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unpaid customer orders
            </p>
          </CardContent>
        </Card>

        {/* New Profit Card */}
        <Card className="shadow-sm border-l-4 border-l-indigo-500 bg-indigo-50/10">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-bold text-indigo-900">Est. Profit</CardTitle>
            <TrendingUp className={cn("h-4 w-4", stats.estimatedProfit >= 0 ? "text-indigo-600" : "text-rose-600")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-indigo-900">${stats.estimatedProfit.toLocaleString()}</div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter mt-1">
               Sales - Operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="w-full" onValueChange={(v) => setTimeframe(v as any)}>
        <TabsList className="grid w-full max-w-[400px] grid-cols-3 bg-muted/50 p-1">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>

        <TabsContent value={timeframe} className="mt-6 space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="text-xl">Transaction Ledger</CardTitle>
                <CardDescription>Comprehensive audit of all financial events</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={txTypeFilter} onValueChange={(v: any) => setTxTypeFilter(v)}>
                  <SelectTrigger className="w-[140px] h-8 text-xs">
                    <Filter className="mr-2 h-3.5 w-3.5" />
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Sale">Sales Log</SelectItem>
                    <SelectItem value="Payment">Payments & Collections</SelectItem>
                    <SelectItem value="Expense">Expenses Only</SelectItem>
                    <SelectItem value="Adjustment">Adjustments</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" className="h-8">
                  <Calendar className="mr-2 h-3.5 w-3.5" /> Date
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Entity / Responsible</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Date</TableHead>
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
                      <TableRow key={idx}>
                        <TableCell>
                          <Badge variant={tx.txType === 'Expense' ? "destructive" : "outline"} className="font-semibold uppercase text-[10px]">
                            {tx.txType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs">{tx.desc}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{tx.responsible}</TableCell>
                        <TableCell className={cn(
                          "font-bold",
                          tx.txType === 'Expense' ? "text-red-600" : "text-emerald-600"
                        )}>
                          {tx.txType === 'Expense' ? "-" : "+"}${parseFloat(tx.amt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{tx.cat}</span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground font-medium">
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Financial Entry</DialogTitle>
            <CardDescription>Add a new payment or charge to the ledger</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Customer</Label>
              <Select value={paymentForm.customerId} onValueChange={(v) => setPaymentForm({...paymentForm, customerId: v})}>
                <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                <SelectContent>
                  {customers.map(c => (
                    <SelectItem key={c.customer_id} value={c.customer_id.toString()}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Transaction Type</Label>
              <Select value={paymentForm.type} onValueChange={(v: any) => setPaymentForm({...paymentForm, type: v, paymentMethod: v === 'payment' ? 'cash' : (v === 'adjustment' ? 'cash' : paymentForm.paymentMethod)})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment (Cash In)</SelectItem>
                  <SelectItem value="charge">Charge (Debt Up)</SelectItem>
                  <SelectItem value="adjustment">Balance Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-sm font-medium">Amount ($)</Label>
              <Input type="number" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} placeholder="0.00" />
            </div>
             {paymentForm.type === "payment" && (
                <>
                  <div className="grid gap-2">
                    <Label className="text-sm font-medium">Payment Method</Label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(v: any) => setPaymentForm({...paymentForm, paymentMethod: v, bankProvider: v === 'cash' ? '' : paymentForm.bankProvider})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentForm.paymentMethod === "transfer" && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                      <Label className="text-sm font-medium">Bank / Provider</Label>
                      <Select value={paymentForm.bankProvider} onValueChange={(v) => setPaymentForm({...paymentForm, bankProvider: v})}>
                        <SelectTrigger><SelectValue placeholder="Select bank" /></SelectTrigger>
                        <SelectContent>
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
              <Label className="text-sm font-medium">Notes</Label>
              <Textarea value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} placeholder="Entry details..." />
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
             <Button onClick={handleRecordPayment} disabled={paymentLoading || !paymentForm.customerId || !paymentForm.amount}>
               {paymentLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
               Save Record
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
