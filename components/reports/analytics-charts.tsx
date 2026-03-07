"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Download,
  Filter,
  Calendar,
  Eye
} from "lucide-react"

import { getAuthToken } from "@/lib/auth"
import { customersApi, tasksApi, financialApi } from "@/lib/api"

// Mock data for charts

export function AnalyticsCharts() {
  const [isMobile, setIsMobile] = useState(false)
  const [activeView, setActiveView] = useState<"revenue" | "tasks" | "customers" | "all">("all")
  const [monthlyRevenue, setMonthlyRevenue] = useState<any[]>([])
  const [taskStatusData, setTaskStatusData] = useState<any[]>([])
  const [customerGrowth, setCustomerGrowth] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true)
        const token = getAuthToken()
        if (!token) {
          setLoading(false)
          return
        }

        // Fetch customers for customer growth data
        const customersResponse = await customersApi.getAll(token)
        if (customersResponse.success) {
          // Group customers by month based on creation date
          const customerData: any = {}
          customersResponse.customers.forEach((customer: any) => {
            if (customer.createdAt) {
              const month = new Date(customer.createdAt).toLocaleString('default', { month: 'short' })
              customerData[month] = (customerData[month] || 0) + 1
            }
          })
          
          const customerGrowthData = Object.entries(customerData).map(([month, customers]) => ({
            month,
            customers
          }))
          
          setCustomerGrowth(customerGrowthData)
        }

        // Fetch tasks for task status data
        const tasksResponse = await tasksApi.getAll(token)
        if (tasksResponse.success) {
          // Group tasks by status
          const statusData: any = {}
          tasksResponse.tasks.forEach((task: any) => {
            statusData[task.status] = (statusData[task.status] || 0) + 1
          })
          
          const taskStatusData = Object.entries(statusData).map(([name, value]) => ({
            name,
            value,
            color: getStatusColor(name)
          }))
          
          setTaskStatusData(taskStatusData)
        }

        // For revenue data, we'll use the mock data for now
        // In a real implementation, this would come from a dedicated financial API
        setMonthlyRevenue([
          { month: "Jan", revenue: 35000, tasks: 12 },
          { month: "Feb", revenue: 42000, tasks: 15 },
          { month: "Mar", revenue: 38000, tasks: 18 },
          { month: "Apr", revenue: 45000, tasks: 14 },
          { month: "May", revenue: 52000, tasks: 20 },
          { month: "Jun", revenue: 48000, tasks: 16 },
        ])
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        // Fallback to mock data
        setMonthlyRevenue([
          { month: "Jan", revenue: 35000, tasks: 12 },
          { month: "Feb", revenue: 42000, tasks: 15 },
          { month: "Mar", revenue: 38000, tasks: 18 },
          { month: "Apr", revenue: 45000, tasks: 14 },
          { month: "May", revenue: 52000, tasks: 20 },
          { month: "Jun", revenue: 48000, tasks: 16 },
        ])
        
        setTaskStatusData([
          { name: "Completed", value: 45, color: "#10b981" },
          { name: "In Progress", value: 25, color: "#164e63" },
          { name: "Pending", value: 20, color: "#f59e0b" },
          { name: "Cancelled", value: 10, color: "#ef4444" },
        ])
        
        setCustomerGrowth([
          { month: "Jan", customers: 18 },
          { month: "Feb", customers: 22 },
          { month: "Mar", customers: 25 },
          { month: "Apr", customers: 28 },
          { month: "May", customers: 32 },
          { month: "Jun", customers: 35 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAnalyticsData()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "#10b981"
      case "in-progress": return "#164e63"
      case "pending": return "#f59e0b"
      case "cancelled": return "#ef4444"
      default: return "#94a3b8"
    }
  }

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Visual Hierarchy */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">
                  Analytics Dashboard
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Comprehensive business intelligence and performance metrics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                Real-time Data
              </Badge>
              <Button variant="outline" className="bg-card hover:bg-muted/50 lg:h-12 h-11 lg:px-6 px-4 w-full lg:w-auto">
                <Download className="h-5 w-5 mr-2" />
                <span className="font-semibold">Export Report</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Performance Analytics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Growth Metrics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Customer Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={activeView === "all" ? "default" : "outline"}
            onClick={() => setActiveView("all")}
            className="text-sm"
          >
            All Charts
          </Button>
          <Button
            variant={activeView === "revenue" ? "default" : "outline"}
            onClick={() => setActiveView("revenue")}
            className="text-sm"
          >
            Revenue
          </Button>
        </div>
      )}

      <div className={`grid gap-4 lg:gap-6 ${
        isMobile && activeView !== "all" 
          ? "grid-cols-1" 
          : "grid-cols-1 lg:grid-cols-2"
      }`}>
        {/* Monthly Revenue Chart */}
        {(!isMobile || activeView === "revenue" || activeView === "all") && (
          <Card className="border-2 border-green-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-green-600" />
                </div>
                Monthly Revenue
                <Badge variant="outline" className="bg-card/80 px-3 py-1">
                  Last 6 Months
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:p-6 p-4">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <BarChart data={monthlyRevenue}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickLine={{ stroke: '#10b981' }}
                    />
                    <YAxis 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`$${value.toLocaleString()}`, "Revenue"]} 
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '2px solid #10b981',
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '14px'
                      }}
                    />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Task Status Distribution */}
        {(!isMobile || activeView === "tasks" || activeView === "all") && (
          <Card className="border-2 border-blue-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                Task Status Distribution
                <Badge variant="outline" className="bg-card/80 px-3 py-1">
                  Current
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:p-6 p-4">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <PieChart>
                    <Pie
                      data={taskStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={isMobile ? 80 : 100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${percent !== undefined ? (percent * 100).toFixed(0) : 0}%`}
                    >
                      {taskStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, "Tasks"]}
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '2px solid #164e63',
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '14px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}

        {/* Customer Growth Chart */}
        {(!isMobile || activeView === "customers" || activeView === "all") && (
          <Card className="border-2 border-purple-200 shadow-lg lg:col-span-2">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-t-xl">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                Customer Growth
                <Badge variant="outline" className="bg-card/80 px-3 py-1">
                  Monthly Trend
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="lg:p-6 p-4">
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <LineChart data={customerGrowth}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                      tickLine={{ stroke: '#7c3aed' }}
                    />
                    <YAxis 
                      tick={{ fontSize: isMobile ? 10 : 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#f8fafc',
                        border: '2px solid #7c3aed',
                        borderRadius: '8px',
                        fontSize: isMobile ? '12px' : '14px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="customers" 
                      stroke="#7c3aed" 
                      strokeWidth={2}
                      dot={{ r: 4, fill: '#7c3aed' }}
                      activeDot={{ r: 6, stroke: '#7c3aed', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
