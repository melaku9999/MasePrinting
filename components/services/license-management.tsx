"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Search, Plus, Edit, RefreshCw, AlertTriangle, Users, Calendar, Key } from "lucide-react"
import { mockLicenses, getLicenseStatusColor, getDaysUntilExpiry, type License } from "@/lib/services"
import { cn } from "@/lib/utils"

interface LicenseManagementProps {
  onEditLicense: (license: License) => void
  onAddLicense: () => void
  onRenewLicense: (license: License) => void
}

export function LicenseManagement({ onEditLicense, onAddLicense, onRenewLicense }: LicenseManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [licenses] = useState<License[]>(mockLicenses)
  const [isMobile, setIsMobile] = useState(false)

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const filteredLicenses = licenses.filter((license) =>
    license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getExpiryWarning = (license: License) => {
    const daysLeft = getDaysUntilExpiry(license.endDate)
    if (daysLeft <= 30 && daysLeft > 0) return "warning"
    if (daysLeft <= 0) return "expired"
    return "normal"
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-orange-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-purple-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Key className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">
                  License Management
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Monitor and manage software licenses</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                {filteredLicenses.length} Licenses
              </Badge>
              <Button 
                onClick={onAddLicense} 
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-white shadow-lg lg:h-12 h-11 lg:px-6 px-4 w-full lg:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                <span className="font-semibold">Add License</span>
              </Button>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Key className="h-4 w-4" />
              <span className="hidden sm:inline">License Tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Expiry Monitoring</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Usage Analytics</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-muted/50 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-muted/20 to-transparent lg:pb-4 pb-3">
          <CardTitle className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-primary" />
            </div>
            Search & Filter Licenses
          </CardTitle>
        </CardHeader>
        <CardContent className="lg:p-6 p-4">
          <div className="relative w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses by key or software..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={cn(
                "pl-10 border-2 focus:border-primary rounded-lg",
                isMobile ? "h-11" : "h-12"
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* License Cards */}
      <div className="space-y-4 lg:space-y-6">
        {filteredLicenses.map((license) => {
          const daysLeft = getDaysUntilExpiry(license.endDate)
          const expiryWarning = getExpiryWarning(license)
          const usagePercentage = (license.currentUsers / license.maxUsers) * 100

          return (
            <Card key={license.id} className={cn(
              "hover:shadow-lg transition-all duration-200 border group",
              expiryWarning === "expired" ? "border-red-200 bg-red-50/50" :
              expiryWarning === "warning" ? "border-orange-200 bg-orange-50/50" :
              "border-muted/50"
            )}>
              <CardHeader className={isMobile ? "p-4 pb-3" : "p-6 pb-4"}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={cn(
                      "rounded-lg flex items-center justify-center flex-shrink-0",
                      isMobile ? "w-10 h-10" : "w-12 h-12",
                      expiryWarning === "expired" ? "bg-red-100" :
                      expiryWarning === "warning" ? "bg-orange-100" :
                      "bg-blue-100"
                    )}>
                      <Key className={cn(
                        isMobile ? "h-5 w-5" : "h-6 w-6",
                        expiryWarning === "expired" ? "text-red-600" :
                        expiryWarning === "warning" ? "text-orange-600" :
                        "text-blue-600"
                      )} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <CardTitle className={cn(
                        "font-mono truncate",
                        isMobile ? "text-base" : "text-lg"
                      )}>
                        {license.licenseKey}
                      </CardTitle>
                      <p className={cn(
                        "text-muted-foreground truncate",
                        isMobile ? "text-sm" : "text-base"
                      )}>
                        {license.softwareName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      className={getLicenseStatusColor(license.status)}
                      variant={expiryWarning === "expired" ? "destructive" : "default"}
                    >
                      {license.status}
                    </Badge>
                    {expiryWarning === "warning" && (
                      <Badge variant="outline" className="text-orange-600 border-orange-600 text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {daysLeft}d left
                      </Badge>
                    )}
                    {expiryWarning === "expired" && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expired
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className={cn(
                "space-y-4",
                isMobile ? "p-4 pt-0" : "p-6 pt-0"
              )}>
                {/* License Details Grid */}
                <div className={cn(
                  "grid gap-4",
                  isMobile ? "grid-cols-1" : "grid-cols-3"
                )}>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Valid Until</p>
                      <p className={cn(
                        "truncate",
                        isMobile ? "text-sm" : "text-sm",
                        expiryWarning === "expired" ? "text-red-600" :
                        expiryWarning === "warning" ? "text-orange-600" :
                        "text-muted-foreground"
                      )}>
                        {new Date(license.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">User Usage</p>
                      <p className="text-sm text-muted-foreground">
                        {license.currentUsers} / {license.maxUsers} users
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-green-600">$</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">Annual Cost</p>
                      <p className={cn(
                        "font-semibold text-secondary",
                        isMobile ? "text-lg" : "text-xl"
                      )}>
                        ${license.cost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Usage Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">License Usage</span>
                    <span className={cn(
                      "font-medium",
                      usagePercentage > 90 ? "text-red-600" :
                      usagePercentage > 75 ? "text-orange-600" :
                      "text-green-600"
                    )}>
                      {usagePercentage.toFixed(0)}%
                    </span>
                  </div>
                  <Progress 
                    value={usagePercentage} 
                    className={cn(
                      "h-2",
                      usagePercentage > 90 ? "[&>div]:bg-red-500" :
                      usagePercentage > 75 ? "[&>div]:bg-orange-500" :
                      "[&>div]:bg-green-500"
                    )} 
                  />
                </div>

                {/* Actions and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-muted/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={license.autoRenew ? "default" : "outline"}
                      className="text-xs"
                    >
                      {license.autoRenew ? "Auto-Renew ON" : "Auto-Renew OFF"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">Customer {license.customerId}</span>
                  </div>
                  
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditLicense(license)}
                      className={cn(
                        "bg-transparent border-2 hover:border-primary/50",
                        isMobile ? "flex-1" : "w-auto"
                      )}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => onRenewLicense(license)}
                      className={cn(
                        "bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary",
                        isMobile ? "flex-1" : "w-auto"
                      )}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Renew
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredLicenses.length === 0 && (
        <Card className="border-2 border-dashed border-muted/50">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <Key className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              {searchTerm ? "No licenses found" : "No licenses available"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? 
                "Try adjusting your search terms to find what you're looking for." : 
                "Get started by adding your first software license."
              }
            </p>
            {searchTerm ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            ) : (
              <Button onClick={onAddLicense} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First License
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
