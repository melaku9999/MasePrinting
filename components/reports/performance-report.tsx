"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  Target, 
  Award,
  BarChart3,
  Users,
  Trophy,
  Star,
  Eye,
  Download,
  Filter
} from "lucide-react"

// Mock performance data
const employeePerformance = [
  {
    id: "2",
    name: "John Employee",
    tasksCompleted: 15,
    tasksInProgress: 3,
    avgCompletionTime: 4.2,
    customerSatisfaction: 4.8,
    efficiency: 92,
  },
  {
    id: "1",
    name: "Admin User",
    tasksCompleted: 8,
    tasksInProgress: 2,
    avgCompletionTime: 3.8,
    customerSatisfaction: 4.9,
    efficiency: 95,
  },
]

const teamMetrics = {
  totalTasksCompleted: 23,
  avgCompletionTime: 4.0,
  customerSatisfactionAvg: 4.85,
  teamEfficiency: 93.5,
  onTimeDelivery: 87,
}

export function PerformanceReport() {
  const [isMobile, setIsMobile] = useState(false)
  const [selectedView, setSelectedView] = useState<"overview" | "detailed">("overview")

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
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Trophy className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">
                  Performance Report
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Team productivity and efficiency analysis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                Performance Analytics
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
              <span className="hidden sm:inline">Team Efficiency</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Growth Metrics</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Quality Assurance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View Toggle */}
      {isMobile && (
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={selectedView === "overview" ? "default" : "outline"}
            onClick={() => setSelectedView("overview")}
            className="text-sm"
          >
            Overview
          </Button>
          <Button
            variant={selectedView === "detailed" ? "default" : "outline"}
            onClick={() => setSelectedView("detailed")}
            className="text-sm"
          >
            Detailed
          </Button>
        </div>
      )}

      {/* Team Overview */}
      {(!isMobile || selectedView === "overview") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          <Card className="border-2 border-green-200 shadow-lg bg-gradient-to-br from-green-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
              <CardTitle className="lg:text-sm text-xs font-medium">Tasks Completed</CardTitle>
              <CheckCircle2 className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="lg:p-4 p-3">
              <div className="lg:text-2xl text-xl font-bold text-secondary">{teamMetrics.totalTasksCompleted}</div>
              <p className="lg:text-xs text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
              <CardTitle className="lg:text-sm text-xs font-medium">Avg Completion</CardTitle>
              <Clock className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="lg:p-4 p-3">
              <div className="lg:text-2xl text-xl font-bold text-primary">{teamMetrics.avgCompletionTime}d</div>
              <p className="lg:text-xs text-xs text-muted-foreground">Per task</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 shadow-lg bg-gradient-to-br from-purple-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
              <CardTitle className="lg:text-sm text-xs font-medium">Satisfaction</CardTitle>
              <Award className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="lg:p-4 p-3">
              <div className="lg:text-2xl text-xl font-bold text-secondary">{teamMetrics.customerSatisfactionAvg}/5</div>
              <p className="lg:text-xs text-xs text-muted-foreground">Customer rating</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 shadow-lg bg-gradient-to-br from-orange-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
              <CardTitle className="lg:text-sm text-xs font-medium">Team Efficiency</CardTitle>
              <TrendingUp className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="lg:p-4 p-3">
              <div className="lg:text-2xl text-xl font-bold text-secondary">{teamMetrics.teamEfficiency}%</div>
              <p className="lg:text-xs text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 shadow-lg bg-gradient-to-br from-red-50 to-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 lg:pb-2 pb-1">
              <CardTitle className="lg:text-sm text-xs font-medium">On-Time Delivery</CardTitle>
              <Target className="lg:h-4 lg:w-4 h-3 w-3 text-muted-foreground" />
            </CardHeader>
            <CardContent className="lg:p-4 p-3">
              <div className="lg:text-2xl text-xl font-bold text-primary">{teamMetrics.onTimeDelivery}%</div>
              <p className="lg:text-xs text-xs text-muted-foreground">Tasks delivered on time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee Performance Table */}
      {(!isMobile || selectedView === "detailed") && (
        <Card className="border-2 border-muted/50 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>
              Employee Performance
              <Badge variant="outline" className="bg-card/80 px-3 py-1">
                {employeePerformance.length} Employees
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="lg:p-6 p-4">
            {isMobile ? (
              /* Mobile Card Layout */
              <div className="space-y-4">
                {employeePerformance.map((employee) => (
                  <Card key={employee.id} className="border border-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground text-lg">{employee.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm font-medium">{employee.customerSatisfaction}/5</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {employee.efficiency}% efficient
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Completed</p>
                            <p className="font-semibold text-green-600">{employee.tasksCompleted} tasks</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">In Progress</p>
                            <p className="font-semibold text-blue-600">{employee.tasksInProgress} tasks</p>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Efficiency</span>
                            <span className="text-xs font-medium">{employee.efficiency}%</span>
                          </div>
                          <Progress value={employee.efficiency} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Avg Completion</span>
                          <span className="font-medium">{employee.avgCompletionTime} days</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              /* Desktop Table Layout */
              <div className="overflow-hidden rounded-lg border border-muted/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20">
                      <TableHead className="font-semibold">Employee</TableHead>
                      <TableHead className="font-semibold">Completed Tasks</TableHead>
                      <TableHead className="font-semibold">In Progress</TableHead>
                      <TableHead className="font-semibold">Avg Completion Time</TableHead>
                      <TableHead className="font-semibold">Customer Rating</TableHead>
                      <TableHead className="font-semibold">Efficiency</TableHead>
                      <TableHead className="font-semibold w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-muted/20">
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{employee.tasksCompleted}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.tasksInProgress}</Badge>
                        </TableCell>
                        <TableCell>{employee.avgCompletionTime} days</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{employee.customerSatisfaction}/5</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-xs ${
                                    i < Math.floor(employee.customerSatisfaction) ? "text-yellow-500" : "text-gray-300"
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={employee.efficiency} className="w-16 h-2" />
                            <span className="text-sm font-medium">{employee.efficiency}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="h-8">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="border-2 border-green-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:p-6 p-4">
            {employeePerformance
              .sort((a, b) => b.efficiency - a.efficiency)
              .map((employee, index) => (
                <div key={employee.id} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center justify-center lg:w-8 lg:h-8 w-6 h-6 bg-secondary text-secondary-foreground rounded-full lg:text-sm text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.efficiency}% efficiency</p>
                  </div>
                  <Badge variant="secondary" className="lg:text-sm text-xs">{employee.tasksCompleted} tasks</Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
            <CardTitle className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </div>
              Performance Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 lg:p-6 p-4">
            <div className="lg:p-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="lg:h-4 lg:w-4 h-3 w-3 text-green-600" />
                <span className="font-medium text-green-800 lg:text-base text-sm">Excellent Team Performance</span>
              </div>
              <p className="lg:text-sm text-xs text-green-700">Team efficiency is above 90% with high customer satisfaction.</p>
            </div>

            <div className="lg:p-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="lg:h-4 lg:w-4 h-3 w-3 text-blue-600" />
                <span className="font-medium text-blue-800 lg:text-base text-sm">Customer Satisfaction</span>
              </div>
              <p className="lg:text-sm text-xs text-blue-700">Average rating of 4.8/5 shows excellent service quality.</p>
            </div>

            <div className="lg:p-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="lg:h-4 lg:w-4 h-3 w-3 text-orange-600" />
                <span className="font-medium text-orange-800 lg:text-base text-sm">Improvement Opportunity</span>
              </div>
              <p className="lg:text-sm text-xs text-orange-700">On-time delivery can be improved from 87% to 95%.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
