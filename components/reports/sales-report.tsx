"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  Search,
  Filter,
  BarChart3,
  Target,
  Eye,
  CheckCircle2,
  Plus
} from "lucide-react"
import { salesApi } from "@/lib/api"
import { SaleForm } from "@/components/sales/sale-form"

export function SalesReport() {
  const [sales, setSales] = useState<any>([])
  const [loading, setLoading] = useState(true)
  const [isSaleFormOpen, setIsSaleFormOpen] = useState(false)
  const [timeRange, setTimeRange] = useState("month")
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    fetchSales()
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      const data = await salesApi.getAll()
      setSales(data.results || data || [])
    } catch (error) {
      console.error("Error fetching sales:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredData = sales.filter((sale: any) => {
    const customer = sale.customer_details?.name || ""
    const employee = sale.created_by_details?.name || ""
    const matchesStatus = statusFilter === "all" || statusFilter === "paid" // Since we only show completed sales for now
    const matchesSearch = searchTerm === "" || 
      customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalRevenue = filteredData.reduce((sum: number, sale: any) => sum + parseFloat(sale.total_amount || 0), 0)
  const paidRevenue = totalRevenue // For now, all completed sales are "paid" in this system
  const pendingRevenue = 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-secondary text-secondary-foreground"
      case "pending":
        return "bg-yellow-500 text-white"
      case "overdue":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <div className="space-y-6 w-full overflow-hidden">
      {/* Enhanced Header with Visual Hierarchy */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl w-full">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <DollarSign className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2 break-words">
                  Sales Report
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Revenue analysis and transaction tracking</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                Financial Analytics
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Revenue Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Growth Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Performance Metrics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters Section */}
      <Card className="border-2 border-muted/50 shadow-lg w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent lg:pb-4 pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            Filters & Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="lg:p-6 p-4 w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
            {/* Search */}
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers, services, employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 lg:h-12 h-11 border-2 focus:border-primary rounded-lg w-full"
              />
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className={`${isMobile ? 'w-full' : 'w-40'} lg:h-12 h-11 border-2 focus:border-primary`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="quarter">This Quarter</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className={`${isMobile ? 'w-full' : 'w-40'} lg:h-12 h-11 border-2 focus:border-primary`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                onClick={() => setIsSaleFormOpen(true)}
                className="bg-primary hover:bg-primary/90 lg:h-12 h-11 lg:px-6 px-4 w-full sm:w-auto gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="font-semibold">Create Sale</span>
              </Button>
              
              <Button variant="outline" className="bg-card hover:bg-muted/50 lg:h-12 h-11 lg:px-6 px-4 w-full sm:w-auto">
                <Download className="h-4 w-4 mr-2" />
                <span className="font-semibold">Export</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <SaleForm 
        isOpen={isSaleFormOpen} 
        onClose={() => setIsSaleFormOpen(false)} 
        onSuccess={fetchSales} 
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 w-full">
        <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-card w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
            <CardTitle className="lg:text-sm text-xs font-medium">Total Revenue</CardTitle>
            <DollarSign className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="lg:p-4 p-3">
            <div className="lg:text-2xl text-xl font-bold text-primary">${totalRevenue.toLocaleString()}</div>
            <p className="lg:text-xs text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-card w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
            <CardTitle className="lg:text-sm text-xs font-medium">Paid Revenue</CardTitle>
            <TrendingUp className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="lg:p-4 p-3">
            <div className="lg:text-2xl text-xl font-bold text-secondary">${paidRevenue.toLocaleString()}</div>
            <p className="lg:text-xs text-xs text-muted-foreground">{((paidRevenue / totalRevenue) * 100).toFixed(1)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-card w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
            <CardTitle className="lg:text-sm text-xs font-medium">Pending Revenue</CardTitle>
            <Calendar className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="lg:p-4 p-3">
            <div className="lg:text-2xl text-xl font-bold text-orange-600">${pendingRevenue.toLocaleString()}</div>
            <p className="lg:text-xs text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-card w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
            <CardTitle className="lg:text-sm text-xs font-medium">Unique Customers</CardTitle>
            <Users className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
          </CardHeader>
          <CardContent className="lg:p-4 p-3">
            <div className="lg:text-2xl text-xl font-bold text-primary">{new Set(sales.map((s: any) => s.customer)).size}</div>
            <p className="lg:text-xs text-xs text-muted-foreground">Active this period</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <Card className="border-2 border-muted/50 shadow-lg w-full overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent">
          <CardTitle className="flex items-center gap-3 flex-wrap">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
            Sales Transactions
            <Badge variant="outline" className="bg-card/80 px-3 py-1">
              {filteredData.length} Results
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="lg:p-6 p-4 w-full">
          {isMobile ? (
            /* Mobile Card Layout */
            <div className="space-y-4 w-full">
              {filteredData.map((sale: any) => (
                <Card key={sale.id} className="border border-muted/50 w-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-card-foreground break-words">{sale.customer_details?.name}</h3>
                        <p className="text-sm text-muted-foreground break-words">
                          {sale.items?.map((item: any) => item.product_name).join(", ")}
                        </p>
                      </div>
                      <Badge className="bg-emerald-500 text-white">Completed</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="font-semibold text-primary">${parseFloat(sale.total_amount).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Date</p>
                        <p className="font-medium">{new Date(sale.created_at).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Employee</p>
                        <p className="font-medium break-words">{sale.created_by_details?.name || "System"}</p>
                      </div>
                      <div className="flex items-center justify-end">
                        <Button variant="outline" size="sm" className="h-8">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            /* Desktop Table Layout */
            <div className="overflow-hidden rounded-lg border border-muted/50 w-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/20">
                    <TableHead className="font-semibold">Customer</TableHead>
                    <TableHead className="font-semibold">Service</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Employee</TableHead>
                    <TableHead className="font-semibold w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">Loading Sales...</TableCell></TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center py-8">No sales found.</TableCell></TableRow>
                  ) : (
                    filteredData.map((sale: any) => (
                      <TableRow key={sale.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium break-words max-w-xs">{sale.customer_details?.name}</TableCell>
                        <TableCell className="break-words max-w-xs">
                          {sale.items?.map((item: any) => item.product_name).join(", ") || "No items"}
                        </TableCell>
                        <TableCell className="font-semibold text-primary">${parseFloat(sale.total_amount).toLocaleString()}</TableCell>
                        <TableCell>{new Date(sale.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500 text-white">Completed</Badge>
                        </TableCell>
                        <TableCell className="break-words max-w-xs">{sale.created_by_details?.name || "System"}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {filteredData.length === 0 && (
            <div className="text-center py-12 w-full">
              <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Sales Found</h3>
              <p className="text-muted-foreground">
                No sales transactions match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}