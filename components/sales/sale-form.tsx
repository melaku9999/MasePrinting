"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Trash2, ShoppingCart, Check, Package } from "lucide-react"
import { salesApi, customersApi, branchesApi } from "@/lib/api"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface SaleFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: {
    id: string
    name: string
    role: "admin" | "employee" | "customer"
    employee_id?: number
    branch_id?: number
  }
  preSelectedItems?: { id: number, product: number, name: string, batch?: string | number, quantity: number, unit_price: number, available: number, branch_id?: number }[]
}

export function SaleForm({ isOpen, onClose, onSuccess, user, preSelectedItems }: SaleFormProps) {
  const isAdmin = user?.role === "admin"
  const [customers, setCustomers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    customer: "",
    branch: "",
    items: [] as { id: number, product: number, name: string, batch?: string | number, quantity: number, unit_price: number, available: number, branch_id?: number }[]
  })

  useEffect(() => {
    if (isOpen) {
      fetchInitialData()
      if (preSelectedItems && preSelectedItems.length > 0) {
        setFormData(prev => ({ ...prev, items: preSelectedItems }))
      }
    } else {
      setFormData({ customer: "", branch: "", items: [] })
    }
  }, [isOpen])

  const fetchInitialData = async () => {
    try {
      const [custData, branchData] = await Promise.all([
        customersApi.getAll(),
        branchesApi.getAll()
      ])
      
      setCustomers(custData.results || custData || [])
      setBranches(branchData.filter((b: any) => !b.is_warehouse))

      if (user?.branch_id && !isAdmin) {
        setFormData(prev => ({ ...prev, branch: user.branch_id!.toString() }))
      } else if (isAdmin && preSelectedItems && preSelectedItems.length > 0) {
        // Auto-select branch if all items come from the same branch
        const branchIds = Array.from(new Set(preSelectedItems.map(i => i.branch_id).filter(Boolean)))
        if (branchIds.length === 1) {
          setFormData(prev => ({ ...prev, branch: branchIds[0]!.toString() }))
        }
      }
    } catch (error) {
      console.error("Error fetching sale data:", error)
      toast.error("Failed to load form data")
    }
  }

  const updateCartQty = (uniqueId: number, qty: number) => {
    const item = formData.items.find(i => i.id === uniqueId)
    if (!item) return
    
    if (qty > item.available) {
       toast.error(`Only ${item.available} units available in stock`)
       qty = item.available
    }
    
    if (qty <= 0) {
      setFormData({ ...formData, items: formData.items.filter(i => i.id !== uniqueId) })
    } else {
      setFormData({
        ...formData,
        items: formData.items.map(i => i.id === uniqueId ? { ...i, quantity: qty } : i)
      })
    }
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)

  const handleSubmit = async () => {
    try {
      if (!formData.branch || formData.items.length === 0) {
        return toast.error("Branch and items are required")
      }

      setLoading(true)
      const payload = {
        customer: formData.customer ? parseInt(formData.customer) : null,
        branch: parseInt(formData.branch),
        items: formData.items.map(item => ({
          product: item.product,
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        total_amount: totalAmount
      }

      console.log("Processing POS Transaction:", payload)
      await salesApi.create(payload)
      toast.success("Transaction finalized!")
      onSuccess()
      onClose()
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || "Failed to finalize sale."
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="p-0 sm:max-w-[450px] w-full flex flex-col bg-white border-l shadow-2xl overflow-hidden">
        <SheetHeader className="p-6 bg-slate-50/50 border-b space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                 <ShoppingCart className="h-5 w-5 text-white" />
              </div>
              <SheetTitle className="text-xl font-bold">Verify & Sell</SheetTitle>
            </div>
            <Badge variant="outline" className="font-mono text-[10px] uppercase">
              {user?.name}
            </Badge>
          </div>

          <div className="grid gap-3 pt-2">
             <div className="space-y-1.5">
                <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Customer (Optional)</Label>
                <select
                  className="w-full h-10 px-3 bg-white border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                >
                  <option value="">Guest / Walk-in</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             {isAdmin && (
               <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Source Branch</Label>
                  <select
                    className="w-full h-10 px-3 bg-white border rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  >
                    <option value="">Select Branch...</option>
                    {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
               </div>
             )}
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
           {formData.items.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                  <Package className="h-10 w-10 text-slate-300" />
                </div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No Items to Verify</p>
                <p className="text-xs text-slate-400 mt-1">Select items from inventory first</p>
             </div>
           ) : (
             <div className="space-y-6">
                <h3 className="text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Transaction Items</h3>
                <div className="space-y-4">
                    {formData.items.map((item) => (
                       <div key={item.id} className="group relative">
                          <div className="flex justify-between items-start mb-2">
                             <div>
                                <span className="font-bold text-sm block tracking-tight line-clamp-1">{item.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                   {item.batch && (
                                      <Badge variant="outline" className="text-[8px] font-black border-slate-200 bg-white">
                                         #{item.batch}
                                      </Badge>
                                   )}
                                   <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 text-[9px] font-bold border-none px-1.5 py-0 h-4">
                                      In Stock: {item.available}
                                   </Badge>
                                   <span className="text-[10px] font-bold text-slate-400 tracking-tighter">${item.unit_price.toFixed(2)}/ea</span>
                                </div>
                             </div>
                             <button 
                               className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-full flex items-center justify-center transition-colors"
                               onClick={() => updateCartQty(item.id, 0)}
                             >
                                <Trash2 className="h-3.5 w-3.5" />
                             </button>
                          </div>
                          <div className="flex items-center justify-between">
                             <div className="flex items-center bg-slate-50 rounded-lg h-9 w-28 p-1 border border-slate-100">
                                <button 
                                  className="w-8 h-full flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all font-bold"
                                  onClick={() => updateCartQty(item.id, item.quantity - 1)}
                                >-</button>
                                <span className="flex-1 text-center text-xs font-black">{item.quantity}</span>
                                <button 
                                  className="w-8 h-full flex items-center justify-center rounded-md hover:bg-white hover:shadow-sm transition-all font-bold text-blue-600"
                                  onClick={() => updateCartQty(item.id, item.quantity + 1)}
                                >+</button>
                             </div>
                            <div className="text-right">
                               <span className="font-mono text-sm font-black text-slate-900 block">
                                  ${(item.quantity * item.unit_price).toFixed(2)}
                               </span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>

        <div className="mt-auto p-6 bg-slate-900 text-white rounded-t-[2rem] shadow-2xl">
           <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center opacity-60">
                 <span className="text-[10px] font-black uppercase tracking-widest">Total Quantity</span>
                 <span className="font-mono text-xs">{formData.items.reduce((acc, i) => acc + i.quantity, 0)} Units</span>
              </div>
              <div className="flex justify-between items-end pt-2">
                 <span className="font-black text-xs uppercase tracking-[0.2em] text-blue-400">Grand Total</span>
                 <div className="text-right">
                    <span className="text-[10px] font-bold block opacity-40 leading-none mb-1">Tax Included</span>
                    <span className="font-mono text-3xl font-black tracking-tighter leading-none">${totalAmount.toFixed(2)}</span>
                 </div>
              </div>
           </div>

           <Button 
             className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 active:scale-95 transition-all outline-none border-none"
             onClick={handleSubmit} 
             disabled={loading || formData.items.length === 0}
           >
             {loading ? (
               <div className="flex items-center gap-2">
                 <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 <span>Processing...</span>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <span>Finalize Transaction</span>
                 <Check className="h-4 w-4" />
               </div>
             )}
           </Button>
           
           <p className="text-center text-[9px] font-bold text-slate-500 mt-4 uppercase tracking-widest">
             Once finalized, inventory levels will be deducted
           </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
