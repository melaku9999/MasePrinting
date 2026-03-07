"use client"

import { useState, useMemo, useEffect } from "react"
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
  TableRow
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DollarSign,
  Plus,
  Search,
  Filter,
  TrendingUp,
  CreditCard,
  User,
  Eye,
  AlertCircle,
  Clock
} from "lucide-react"
import type { Customer, Payment } from "@/lib/auth"
import { customersApi } from "@/lib/api"
import { cn } from "@/lib/utils"

interface PaymentFormData {
  customerId: string
  amount: number | string
  notes: string
  type: "payment" | "charge" | "adjustment"
  paymentMethod?: "cash" | "transfer"
  bankProvider?: string
}

interface BalanceAdjustmentData {
  customerId: string
  amount: number | string
  notes: string
}

interface FinancialManagerProps {
  user?: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
  }
}

export function FinancialManager({ user }: FinancialManagerProps) {
  if (!user) {
     return <div className="p-8 text-center text-muted-foreground">User session required</div>
  }
  const isAdmin = user.role === "admin"

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"name" | "outstandingBalance">("outstandingBalance")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false)
  const [isPaymentHistoryModalOpen, setIsPaymentHistoryModalOpen] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    customerId: "",
    amount: "",
    notes: "",
    type: "payment",
    paymentMethod: undefined,
    bankProvider: ""
  })
  const [adjustmentForm, setAdjustmentForm] = useState<BalanceAdjustmentData>({
    customerId: "",
    amount: "",
    notes: ""
  })
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [serverTotalDebt, setServerTotalDebt] = useState(0)
  const [serverTotalCredit, setServerTotalCredit] = useState(0)

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        page_size: 10,
        status: statusFilter,
        ordering: sortBy
      }
      if (searchTerm) params.search = searchTerm

      const response = await customersApi.getAll(params)
      if (response && (response as any).results) {
        const res = response as any
        setServerTotalDebt(res.total_debt || 0)
        setServerTotalCredit(res.total_credit || 0)
        setCustomers(res.results.map((c: any) => ({
          ...c,
          id: c.id.toString(),
          balance: parseFloat(c.balance)
        })))
        setTotalPages(Math.ceil(res.count / 10))
        setError(null)
      }
    } catch (err) {
      setError("Failed to load customer accounts")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [currentPage, searchTerm, statusFilter, sortBy])

  useEffect(() => {
    const fetchPayments = async () => {
      if (selectedCustomer && isPaymentHistoryModalOpen) {
        try {
          const res = await customersApi.getPayments(selectedCustomer.id)
          setCustomerPayments(Array.isArray(res) ? res : [])
        } catch (err) {
          console.error(err)
        }
      }
    }
    fetchPayments()
  }, [selectedCustomer, isPaymentHistoryModalOpen])

  const handleRecordPayment = async () => {
    try {
      await customersApi.addPayment(paymentForm.customerId, {
        amount: paymentForm.amount.toString(),
        type: paymentForm.type,
        notes: paymentForm.notes,
        paymentMethod: paymentForm.type === 'payment' ? paymentForm.paymentMethod : undefined,
        bankProvider: paymentForm.paymentMethod === 'transfer' ? paymentForm.bankProvider : undefined
      })
      setIsPaymentModalOpen(false)
      fetchCustomers()
    } catch (error) {
      console.error(error)
    }
  }

  const handleAdjustBalance = async () => {
    try {
      await customersApi.addPayment(adjustmentForm.customerId, {
        amount: adjustmentForm.amount.toString(),
        type: "adjustment",
        notes: adjustmentForm.notes
      })
      setIsAdjustmentModalOpen(false)
      fetchCustomers()
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground text-sm">Manage customer balances and payment records</p>
        </div>
        <div className="flex gap-2">
           <Card className="flex items-center px-4 py-2 border shadow-sm">
             <div className="mr-4">
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Outstanding</p>
               <p className="text-lg font-bold text-red-600">${serverTotalDebt.toLocaleString()}</p>
             </div>
             <div className="w-px h-8 bg-border mr-4" />
             <div>
               <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Total Credits</p>
               <p className="text-lg font-bold text-emerald-600">${serverTotalCredit.toLocaleString()}</p>
             </div>
           </Card>
        </div>
      </div>

      <Card className="shadow-sm border">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative w-full md:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="indebt">In Debt</SelectItem>
                  <SelectItem value="upfront">Paid Upfront</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                <SelectTrigger className="w-[180px]">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="outstandingBalance">Debt Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Last Transaction</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading accounts...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No customers found</TableCell>
                </TableRow>
              ) : (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center font-bold text-xs">
                          {customer.name.charAt(0)}
                        </div>
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.balance < 0 ? (
                        <Badge variant="outline" className="border-red-200 bg-red-50 text-red-700">In Debt</Badge>
                      ) : customer.balance > 0 ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">Credit</Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">Clear</Badge>
                      )}
                    </TableCell>
                    <TableCell className={cn("font-bold", customer.balance < 0 ? "text-red-600" : "text-emerald-600")}>
                      ${Math.abs(customer.balance).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                       <div className="flex items-center gap-1">
                         <Clock className="h-3 w-3" />
                         {customer.paymentHistory?.[0]?.date ? new Date(customer.paymentHistory[0].date).toLocaleDateString() : "No history"}
                       </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <div className="flex justify-end gap-2">
                         <Button variant="outline" size="sm" onClick={() => {
                           setSelectedCustomer(customer)
                           setPaymentForm({...paymentForm, customerId: customer.id})
                           setIsPaymentModalOpen(true)
                         }}>
                           Record
                         </Button>
                         <Button variant="ghost" size="sm" onClick={() => {
                           setSelectedCustomer(customer)
                           setIsPaymentHistoryModalOpen(true)
                         }}>
                           <Eye className="h-4 w-4" />
                         </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          
          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</Button>
              <span className="text-sm font-medium">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <CardDescription>Record a new transaction for {selectedCustomer?.name}</CardDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Transaction Type</label>
              <Select value={paymentForm.type} onValueChange={(v: any) => setPaymentForm({...paymentForm, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="payment">Payment (Cash In)</SelectItem>
                  <SelectItem value="charge">Charge (Debt Up)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">Amount ($)</label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} />
            </div>
             {paymentForm.type === "payment" && (
                <>
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">Method</label>
                    <Select value={paymentForm.paymentMethod} onValueChange={(v: any) => setPaymentForm({...paymentForm, paymentMethod: v, bankProvider: v === 'cash' ? '' : paymentForm.bankProvider})}>
                      <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {paymentForm.paymentMethod === "transfer" && (
                    <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-medium">Bank / Provider</label>
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
              <label className="text-sm font-medium">Notes</label>
              <Input value={paymentForm.notes} onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
             <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
             <Button onClick={handleRecordPayment}>Save Record</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPaymentHistoryModalOpen} onOpenChange={setIsPaymentHistoryModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>History - {selectedCustomer?.name}</DialogTitle>
          </DialogHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customerPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.date).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant="outline">{p.type}</Badge></TableCell>
                  <TableCell className={cn("font-bold", p.type === 'payment' ? 'text-emerald-600' : 'text-red-500')}>
                    ${parseFloat(String(p.amount)).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {(p as any).paymentMethod === 'transfer' && (p as any).bankProvider
                      ? `${p.notes || ''} (via ${({telebirr: 'Tele Birr', cbe: 'CBE', awash: 'Awash', abyssinia: 'Abyssinia'} as any)[(p as any).bankProvider] || (p as any).bankProvider})`
                      : p.notes
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    </div>
  )
}
