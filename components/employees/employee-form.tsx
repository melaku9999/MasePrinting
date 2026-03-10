"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  User, 
  Settings, 
  Key, 
  Eye, 
  EyeOff,
  Save,
  Mail,
  Phone,
  MapPin,
  Building,
  UserCheck,
  Shield,
  ArrowLeft,
  Users,
  Layers,
  Target,
  Award,
  Briefcase,
  DollarSign
} from "lucide-react"
import { branchesApi } from "@/lib/api"
import type { User as AuthUser } from "@/lib/auth"

interface EmployeeFormProps {
  employee?: any
  onSave: (employee: any) => void
  onCancel: () => void
}

export function EmployeeForm({ employee, onSave, onCancel }: EmployeeFormProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [branches, setBranches] = useState<any[]>([])

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    // Fetch branches
    branchesApi.getAll().then(setBranches).catch(console.error)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    username: employee?.username || "",
    phone: employee?.phone || "",
    address: employee?.address || "",
    role: employee?.role || "employee",
    status: employee?.status || "active",
    branch: employee?.branch?.toString() || employee?.branch_id?.toString() || "none",
    bio: employee?.bio || "",
    department: employee?.department || "",
    job_title: employee?.job_title || "",
    employeeId: employee?.id || "",
    start_date: employee?.start_date || "",
    emergency_contact_person: employee?.emergency_contact_person || "",
    emergency_contact_person_phone: employee?.emergency_contact_person_phone || "",
    monthly_salary: employee?.monthly_salary ? parseFloat(employee.monthly_salary) : 0,
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!employee && !formData.username) {
      alert("Username is required")
      return
    }

    if (!employee && passwordData.password !== passwordData.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    
    if (!employee && passwordData.password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }
    
    onSave({
      ...formData,
      ...(!employee ? { 
        password: passwordData.password 
      } : {}),
      id: employee?.id || undefined,
    })
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Visual Hierarchy */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl" />
        <div className="relative lg:p-6 p-4 bg-card/80 backdrop-blur-sm border rounded-xl">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4 gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="bg-card hover:bg-muted/50 lg:px-4 px-3 lg:h-auto h-10"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to Employees</span>
                <span className="sm:hidden">Back</span>
              </Button>
              <div className="lg:w-16 lg:h-16 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserCheck className="lg:h-8 lg:w-8 h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="lg:text-3xl text-2xl font-bold text-card-foreground mb-2">
                  {employee ? "Edit Employee Profile" : "Create New Employee"}
                </h1>
                <p className="text-muted-foreground lg:text-lg text-base hidden sm:block">Employee account management and configuration</p>
              </div>
            </div>
            <div className="flex items-center gap-3 lg:flex-row flex-col lg:w-auto w-full">
              <Badge variant="outline" className="bg-card/80 lg:text-lg text-base lg:px-4 px-3 lg:py-2 py-1.5">
                {employee ? "Edit Mode" : "New Employee"}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Employee Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Account Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Award className="h-4 w-4" />
              <span className="hidden sm:inline">Professional Profile</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Enhanced Profile Summary Card */}
        <Card className="lg:col-span-1 border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-blue-200 shadow-lg">
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                    {formData.name ? formData.name.charAt(0).toUpperCase() : "E"}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserCheck className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-xl text-card-foreground">{formData.name || "New Employee"}</h3>
                <p className="text-sm text-muted-foreground">@{formData.username || "username"}</p>
                <p className="text-xs text-muted-foreground">{formData.email || "employee@company.com"}</p>
                <Badge variant="outline" className="text-sm px-3 py-1 bg-blue-50 text-blue-700 border-blue-200">
                  {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}
                </Badge>
              </div>
              
              {/* Quick Stats */}
              <div className="w-full space-y-3 pt-4 border-t border-blue-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Department</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    {formData.department || "N/A"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {formData.status || "Active"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">ID</span>
                  <span className="font-semibold text-blue-600">{formData.employeeId || "Auto-Generated"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Main Content */}
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1' : employee ? 'grid-cols-2' : 'grid-cols-3'} lg:h-12 h-10 bg-muted/50 rounded-xl p-1`}>
              <TabsTrigger value="personal" className={`flex items-center lg:gap-2 gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm lg:flex-row flex-col lg:px-3 px-2 lg:py-2 py-1 ${isMobile ? 'justify-start p-3' : ''}`}>
                <User className="lg:h-4 lg:w-4 h-3 w-3" />
                <span className={`lg:text-sm text-xs ${isMobile ? 'text-sm' : 'lg:inline block text-center'}`}>Personal Info</span>
              </TabsTrigger>
              <TabsTrigger value="employment" className={`flex items-center lg:gap-2 gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm lg:flex-row flex-col lg:px-3 px-2 lg:py-2 py-1 ${isMobile ? 'justify-start p-3' : ''}`}>
                <Briefcase className="lg:h-4 lg:w-4 h-3 w-3" />
                <span className={`lg:text-sm text-xs ${isMobile ? 'text-sm' : 'lg:inline block text-center'}`}>Employment Info</span>
              </TabsTrigger>
              {!employee && (
                <TabsTrigger value="security" className={`flex items-center lg:gap-2 gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm lg:flex-row flex-col lg:px-3 px-2 lg:py-2 py-1 ${isMobile ? 'justify-start p-3' : ''}`}>
                  <Key className="lg:h-4 lg:w-4 h-3 w-3" />
                  <span className={`lg:text-sm text-xs ${isMobile ? 'text-sm' : 'lg:inline block text-center'}`}>Security</span>
                </TabsTrigger>
              )}
              {employee && (
                <TabsTrigger value="settings" className="flex items-center lg:gap-2 gap-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm lg:flex-row flex-col lg:px-3 px-2 lg:py-2 py-1">
                  <Settings className="lg:h-4 lg:w-4 h-3 w-3" />
                  <span className="lg:text-sm text-xs lg:inline block text-center">Settings</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Enhanced Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6 mt-6">
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-base font-semibold flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-blue-600" />
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="Enter unique username"
                      className="h-12 border-2 focus:border-blue-400 rounded-lg"
                      required
                      disabled={!!employee}
                    />
                    {employee && <p className="text-xs text-muted-foreground">Username cannot be changed after onboarding.</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="name" className="text-base font-semibold flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" />
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter employee full name"
                        className="h-12 border-2 focus:border-blue-400 rounded-lg"
                        required
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="email" className="text-base font-semibold flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Email Address *
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="employee@company.com"
                          className="h-12 pl-12 border-2 focus:border-blue-400 rounded-lg"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="phone" className="text-base font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Phone Number
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-12 pl-12 border-2 focus:border-blue-400 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-base font-semibold flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-600" />
                        Role
                      </Label>
                      <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-400 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Administrator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="address" className="text-base font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      Address
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="123 Main Street, City, State 12345"
                        className="pl-12 min-h-[120px] border-2 focus:border-blue-400 rounded-lg resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="job_title">Job Title</Label>
                      <Input
                        id="job_title"
                        value={formData.job_title}
                        onChange={(e) => handleInputChange("job_title", e.target.value)}
                        placeholder="Software Developer, Manager, etc."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={formData.department}
                        onChange={(e) => handleInputChange("department", e.target.value)}
                        placeholder="IT, HR, Operations, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_person">Emergency Contact Person</Label>
                      <Input
                        id="emergency_contact_person"
                        value={formData.emergency_contact_person}
                        onChange={(e) => handleInputChange("emergency_contact_person", e.target.value)}
                        placeholder="Emergency contact name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emergency_contact_person_phone">Emergency Contact Phone</Label>
                      <Input
                        id="emergency_contact_person_phone"
                        value={formData.emergency_contact_person_phone}
                        onChange={(e) => handleInputChange("emergency_contact_person_phone", e.target.value)}
                        placeholder="Emergency phone number"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="bio" className="text-base font-semibold">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about your professional background and experience..."
                      className="min-h-[120px] border-2 focus:border-blue-400 rounded-lg resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 lg:p-6 p-4 rounded-xl border border-blue-200">
                    <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Employee Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>All information is securely encrypted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span>Email will be used for work notifications</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Emergency contacts for safety</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span>Bio visible to team members</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Employment Tab */}
            <TabsContent value="employment" className="space-y-6 mt-6">
              <Card className="border-2 border-blue-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="h-5 w-5 text-blue-600" />
                    </div>
                    Employment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div className="space-y-3">
                      <Label htmlFor="start_date" className="text-base font-semibold">Start Date</Label>
                      <Input
                        id="start_date"
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange("start_date", e.target.value)}
                        className="h-12 border-2 focus:border-blue-400 rounded-lg"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="monthly_salary" className="text-base font-semibold flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        Monthly Salary ($)
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="monthly_salary"
                          type="number"
                          min="0"
                          value={formData.monthly_salary}
                          onChange={(e) => handleInputChange("monthly_salary", Number.parseFloat(e.target.value) || 0)}
                          placeholder="4000"
                          className="h-12 pl-12 border-2 focus:border-blue-400 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="branch" className="text-base font-semibold flex items-center gap-2">
                        <Building className="h-4 w-4 text-blue-600" />
                        Assigned Branch
                      </Label>
                      <Select value={formData.branch} onValueChange={(value) => handleInputChange("branch", value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-400 rounded-lg">
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No Branch (Remote/HQ)</SelectItem>
                          {branches.map((b) => (
                            <SelectItem key={b.id} value={b.id.toString()}>{b.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label htmlFor="status" className="text-base font-semibold">Employment Status</Label>
                      <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                        <SelectTrigger className="h-12 border-2 focus:border-blue-400 rounded-lg">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="terminated">Terminated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                    <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Building className="h-5 w-5 text-blue-600" />
                      Employment Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Employee information is confidential and secure</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span>Salary information only visible to admin users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <span>Start date used for benefits and tenure calculations</span>
                      </div>

                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Account Setup Tab (for new employees) */}
            {!employee && (
              <TabsContent value="security" className="space-y-6 mt-6">
                <Card className="border-2 border-blue-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-xl">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Key className="h-5 w-5 text-blue-600" />
                      </div>
                      Account Setup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-6">
                    <div className="space-y-6">
                      {/* The username is now in the Personal Info tab or can be set here if not set elsewhere */}
                      {!formData.username && (
                        <div className="space-y-3">
                          <Label htmlFor="security-username" className="text-base font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-600" />
                            Username *
                          </Label>
                          <Input
                            id="security-username"
                            value={formData.username}
                            onChange={(e) => handleInputChange("username", e.target.value)}
                            placeholder="Enter username"
                            className="h-12 border-2 focus:border-blue-400 rounded-lg"
                            required
                          />
                        </div>
                      )}

                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-base font-semibold flex items-center gap-2">
                          <Key className="h-4 w-4 text-blue-600" />
                          Initial Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={passwordData.password}
                            onChange={(e) => handlePasswordChange("password", e.target.value)}
                            placeholder="Enter initial password"
                            className="h-12 border-2 focus:border-blue-400 rounded-lg"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="confirmPassword" className="text-base font-semibold flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          Confirm Password *
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            placeholder="Confirm the password"
                            className="h-12 border-2 focus:border-blue-400 rounded-lg"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
                        <h4 className="text-base font-semibold mb-3 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          Password Requirements
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>At least 8 characters long</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span>Include uppercase and lowercase letters</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            <span>Include at least one number</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full" />
                            <span>Include at least one special character</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}

            {/* Settings Tab (for existing employees) */}
            {employee && (
              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">Receive account updates via email</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Task Updates</p>
                          <p className="text-sm text-muted-foreground">Get notified when tasks are updated</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">System Alerts</p>
                          <p className="text-sm text-muted-foreground">Important system maintenance and updates</p>
                        </div>
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-muted/50">
            <Button 
              onClick={handleSubmit} 
              className="flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg lg:h-12 h-11 lg:px-8 px-6 order-1 sm:order-1"
            >
              <Save className="h-5 w-5" />
              <span className="font-semibold">
                {employee ? "Update Employee" : "Create Employee"}
              </span>
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel} 
              className="bg-card hover:bg-muted/50 border-2 lg:h-12 h-11 lg:px-8 px-6 font-semibold order-2 sm:order-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}