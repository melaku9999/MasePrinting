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
  DollarSign,
  ArrowLeft,
  Users,
  Layers,
  Target,
  Shield,
  Bell
} from "lucide-react"
import type { Customer } from "@/lib/auth"
import { getAuthToken } from "@/lib/auth"
import { customersApi } from "@/lib/api"

interface CustomerFormProps {
  customer?: Customer
  onSave: (customer: Partial<Customer>) => void
  onCancel: () => void
}

export function CustomerForm({ customer, onSave, onCancel }: CustomerFormProps) {
  const [activeTab, setActiveTab] = useState("personal")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
  
  const [formData, setFormData] = useState({
    name: customer?.name || "",
    email: customer?.email || "",
    phone: customer?.phone || "",
    address: customer?.address || "",
    status: customer?.status || "active",
    prepaymentBalance: customer?.prepaymentBalance || 0,
    website: customer?.website || "",
  })

  // Password form state
  const [passwordData, setPasswordData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customer && passwordData.password !== passwordData.confirmPassword) {
      alert("Passwords don't match")
      return
    }
    if (!customer && passwordData.password.length < 8) {
      alert("Password must be at least 8 characters long")
      return
    }
    
    // Prepare customer data according to your backend API
    let customerData: any;
    
    if (!customer) {
      // For new customer creation, use your backend structure
      customerData = {
        username: passwordData.username || formData.email.split('@')[0],
        email: formData.email,
        password: passwordData.password,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        website: formData.website,
        status: formData.status,
      }
    } else {
      // For existing customer updates, use the update structure
      customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        status: formData.status,
      }
    }
    
    // Call the onSave function which will handle API calls
    onSave(customerData)
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Notion-style Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <Button variant="ghost" onClick={onCancel} className="text-slate-500 hover:text-slate-900 -ml-2 rounded-lg h-8 px-2 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Cancel and Return
          </Button>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
              {customer ? "Update Profile" : "Register Entity"}
            </h1>
            <Badge className="font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-900 hover:bg-slate-100">
              {customer ? "Entry Management" : "Direct Registry"}
            </Badge>
          </div>
          <p className="text-slate-500 text-lg max-w-xl">
            {customer 
              ? "Modify existing account parameters and operational context."
              : "Register a new business entity into the system directory."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSubmit}
            className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-8 rounded-lg font-bold transition-all active:scale-95"
          >
            <Save className="h-4 w-4 mr-2" />
            {customer ? "Save Changes" : "Create Record"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <div className="space-y-12">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-transparent border-b border-slate-100 w-full justify-start rounded-none h-auto p-0 mb-8 overflow-x-auto flex-nowrap">
              <TabsTrigger 
                value="personal" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-6 py-3 font-bold text-slate-400 data-[state=active]:text-slate-900 transition-all shrink-0"
              >
                Personal Data
              </TabsTrigger>
              <TabsTrigger 
                value="financial" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-6 py-3 font-bold text-slate-400 data-[state=active]:text-slate-900 transition-all shrink-0"
              >
                Commercial
              </TabsTrigger>
              {!customer && (
                <TabsTrigger 
                  value="security" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent px-6 py-3 font-bold text-slate-400 data-[state=active]:text-slate-900 transition-all shrink-0"
                >
                  Credentialing
                </TabsTrigger>
              )}
            </TabsList>

            <TabsContent value="personal" className="space-y-12 mt-0 focus-visible:outline-none">
              <section className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Identification</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="name" className="text-xs font-black uppercase text-slate-500 tracking-wider">Entity Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="h-12 rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900/5 transition-all font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="text-xs font-black uppercase text-slate-500 tracking-wider">Primary Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="contact@entity.com"
                        className="h-12 pl-12 rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900/5 transition-all font-bold"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="phone" className="text-xs font-black uppercase text-slate-500 tracking-wider">Direct Phone</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="+1 (000) 000-0000"
                        className="h-12 pl-12 rounded-xl border-slate-200 focus:border-slate-900 focus:ring-slate-900/5 transition-all font-bold"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="status" className="text-xs font-black uppercase text-slate-500 tracking-wider">Registry Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                      <SelectTrigger className="h-12 rounded-xl border-slate-200 focus:border-slate-900 transition-all font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="active" className="font-bold">Active Partner</SelectItem>
                        <SelectItem value="inactive" className="font-bold">Inactive / Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="website" className="text-xs font-black uppercase text-slate-500 tracking-wider">Entity Website</Label>
                    <div className="relative">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        placeholder="https://www.company.com"
                        className="h-12 pl-12 rounded-xl border-slate-200 focus:border-slate-900 font-bold"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Location & Logistics</h3>
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-xs font-black uppercase text-slate-500 tracking-wider">Registered Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Official business residence..."
                      className="pl-12 min-h-[100px] rounded-2xl border-slate-200 focus:border-slate-900 focus:ring-slate-900/5 transition-all font-bold resize-none"
                    />
                  </div>
                </div>
              </section>


            </TabsContent>

            <TabsContent value="financial" className="space-y-12 mt-0 focus-visible:outline-none">
              <section className="space-y-8">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Initial Capitalization</h3>
                <div className="space-y-3">
                  <Label htmlFor="prepaymentBalance" className="text-xs font-black uppercase text-slate-500 tracking-wider">Seed Balance Registry ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="prepaymentBalance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.prepaymentBalance}
                      onChange={(e) => handleInputChange("prepaymentBalance", parseFloat(e.target.value) || 0)}
                      className="h-16 pl-12 rounded-2xl border-slate-200 focus:border-slate-900 text-2xl font-black"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-slate-400 text-xs font-medium">Initial funds available for operational drawdown upon registry confirmation.</p>
                </div>
              </section>

              <div className="p-8 rounded-3xl bg-slate-900 text-white shadow-xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                    <Shield className="h-6 w-6 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-black leading-tight">Financial Governance</h4>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Protocol V1.4</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Auto-deduction for completed workflows</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Low balance automated notifications</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Audit logs for every commercial entry</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-slate-300 font-medium">Secure encryption of all fiscal data</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            {!customer && (
              <TabsContent value="security" className="space-y-12 mt-0 focus-visible:outline-none">
                <section className="space-y-8">
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 border-l-2 border-slate-900 pl-4">Identity Credentials</h3>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="username" className="text-xs font-black uppercase text-slate-500 tracking-wider">Access Identifier (Username) *</Label>
                      <Input
                        id="username"
                        value={passwordData.username}
                        onChange={(e) => handlePasswordChange("username", e.target.value)}
                        placeholder="e.g. acme_admin"
                        className="h-12 rounded-xl border-slate-200 focus:border-slate-900 font-bold"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="password" className="text-xs font-black uppercase text-slate-500 tracking-wider">Initial Passphrase *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={passwordData.password}
                            onChange={(e) => handlePasswordChange("password", e.target.value)}
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-slate-200 focus:border-slate-900 font-bold"
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-900"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label htmlFor="confirmPassword" className="text-xs font-black uppercase text-slate-500 tracking-wider">Verify Passphrase *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={passwordData.confirmPassword}
                            onChange={(e) => handlePasswordChange("confirmPassword", e.target.value)}
                            placeholder="••••••••"
                            className="h-12 rounded-xl border-slate-200 focus:border-slate-900 font-bold"
                            required
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-900"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-slate-900" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">Security Requirement</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Registry passwords must be alphanumeric, contain at least 8 units, and include specialized symbols for vault encryption compatibility.
                    </p>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>

          <div className="pt-8 flex flex-col sm:flex-row gap-4">
            <Button
              onClick={handleSubmit}
              className="flex-1 h-14 bg-slate-900 hover:bg-slate-800 text-white shadow-xl rounded-2xl font-black transition-all active:scale-[0.98]"
            >
              <Save className="h-5 w-5 mr-3" />
              {customer ? "COMMIT REGISTRY UPDATES" : "FINALIZE ENTITY REGISTRATION"}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-10 h-14 rounded-2xl border-slate-200 text-slate-500 font-black hover:bg-slate-50 transition-all"
            >
              DISCARD
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
