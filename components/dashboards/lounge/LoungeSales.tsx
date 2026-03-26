"use client"

import { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  Receipt, 
  ChevronRight,
  ShoppingCart,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getFnbProducts, createFnbSale, getFnbCategories, customersApi } from "@/lib/api"
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select"
import { toast } from "sonner"

export function LoungeSales() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("walkin")
  const [cart, setCart] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [overridePassword, setOverridePassword] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prods, cats, custs] = await Promise.all([
        getFnbProducts(),
        getFnbCategories(),
        customersApi.getAll({ business_type: 'fnb', page_size: 100 })
      ])
      setProducts(prods || [])
      setCategories(cats || [])
      setCustomers(custs.results || [])
    } catch (err) {
      console.error("Error fetching Diva Lounge data:", err)
      toast.error("Failed to load lounge data")
    }
  }

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const handleCheckout = async (isOverride = false, isDebt = false) => {
    if (cart.length === 0) return
    const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    try {
      await createFnbSale({
        items: cart.map(item => ({ menu_product_id: item.id, quantity: item.quantity })),
        total_amount: total_amount,
        customer_id: selectedCustomerId === "walkin" ? "walkin" : parseInt(selectedCustomerId),
        is_debt: isDebt,
        manager_override: isOverride
      })
      setCart([])
      setSelectedCustomerId("walkin")
      setIsOverrideModalOpen(false)
      setOverridePassword("")
      toast.success(isDebt ? "Recorded as customer debt" : "Sale recorded successfully")
      fetchData()
    } catch (err: any) {
      if (err.message?.includes("Manager override required")) {
        setIsOverrideModalOpen(true)
      } else {
        toast.error(err.message || "Sale failed. Please try again.")
      }
    }
  }

  const handleOverrideSubmit = () => {
    if (overridePassword === "manager123") {
      handleCheckout(true, false) // Defaulting to non-debt for override for now
    } else {
      toast.error("Invalid Manager Password")
    }
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0)

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0a0a0b] text-white">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0 p-6">
            <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            Menu <ChevronRight className="h-6 w-6 text-amber-500/50" />
                            <span className="text-amber-500">{selectedCategory}</span>
                        </h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Select items to fulfill experience</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                            <Input 
                                placeholder="Search menu..." 
                                className="pl-9 h-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide shrink-0">
                    <Badge 
                        onClick={() => setSelectedCategory("All")}
                        className={cn(
                            "cursor-pointer transition-all h-9 px-6 font-black uppercase tracking-widest text-[10px] border shadow-lg",
                            selectedCategory === "All" 
                                ? "bg-amber-500 text-black border-amber-500 hover:bg-amber-400" 
                                : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-white/5 backdrop-blur-md"
                        )}
                        variant="outline"
                    >
                        All
                    </Badge>
                    {categories.map(cat => (
                        <Badge 
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.name)}
                            className={cn(
                                "cursor-pointer transition-all h-9 px-6 font-black uppercase tracking-widest text-[10px] border shadow-lg",
                                selectedCategory === cat.name 
                                    ? "bg-amber-500 text-black border-amber-500 hover:bg-amber-400" 
                                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border-white/5 backdrop-blur-md"
                            )}
                            variant="outline"
                        >
                            {cat.name}
                        </Badge>
                    ))}
                </div>
                
                <ScrollArea className="flex-1 pr-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
                        {products
                            .filter(p => selectedCategory === "All" || p.category_name === selectedCategory)
                            .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            .map(prod => (
                                <ProductCard key={prod.id} product={prod} onAdd={() => addToCart(prod)} />
                            ))
                        }
                    </div>
                </ScrollArea>
            </div>

            {/* Checkout Box */}
            <Card className="bg-zinc-900/60 backdrop-blur-2xl border-white/5 flex flex-col overflow-hidden h-full shadow-2xl relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-200/20" />
                <CardHeader className="pb-4 border-b border-white/5 pt-6 space-y-4">
                    <CardTitle className="flex justify-between items-center text-lg font-black tracking-tight text-white">
                        <span>Experience Summary</span>
                        <Receipt className="h-5 w-5 text-amber-500" />
                    </CardTitle>
                    <div className="space-y-1.5">
                        <Label className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-500 ml-1">Client Registry</Label>
                        <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                            <SelectTrigger className="h-10 bg-white/5 border-white/10 text-white font-bold text-xs rounded-xl focus:ring-amber-500/20">
                                <SelectValue placeholder="Walk-in Customer" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="walkin" className="font-bold text-xs uppercase tracking-tighter hover:bg-white/5 focus:bg-white/5">Walk-in Customer</SelectItem>
                                {customers.map(c => (
                                    <SelectItem key={c.id} value={c.id.toString()} className="font-bold text-xs italic">
                                        {c.name} {c.phone ? `(${c.phone})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                    <ScrollArea className="flex-1 p-6">
                        {cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-zinc-700">
                                <div className="h-16 w-16 rounded-full border-2 border-dashed border-white/5 flex items-center justify-center mb-4">
                                    <ShoppingCart className="h-6 w-6" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest">Awaiting Selections</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cart.map((item: any) => (
                                    <div key={item.id} className="flex justify-between items-center group bg-white/5 p-4 rounded-xl border border-white/5 hover:border-amber-500/30 transition-all shadow-lg active:scale-[0.98]">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-white">{item.name}</span>
                                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">ETB {item.price} × {item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-black text-amber-500">{(item.price * item.quantity).toFixed(2)}</span>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-7 w-7 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-red-500/20"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                <Plus className="h-3 w-3 rotate-45" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                    
                    <div className="p-6 bg-black/40 border-t border-white/5 space-y-5">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                                <span>Contribution Subtotal</span>
                                <span className="text-zinc-400">ETB {subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                                <span className="text-xs font-black uppercase text-zinc-500">Total Experience</span>
                                <span className="text-3xl font-black text-amber-500 tracking-tighter">ETB {subtotal.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button 
                                className="flex-1 h-16 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all rounded-xl" 
                                disabled={cart.length === 0}
                                onClick={() => handleCheckout(false, false)}
                            >
                                Cash / Paid
                            </Button>
                             <Button 
                                variant="outline"
                                className="flex-1 h-16 border-2 border-amber-500/20 hover:bg-amber-500/10 text-amber-500 font-black text-xs uppercase tracking-[0.2em] active:scale-[0.98] transition-all rounded-xl disabled:opacity-50 disabled:grayscale" 
                                disabled={cart.length === 0 || selectedCustomerId === "walkin"}
                                onClick={() => handleCheckout(false, true)}
                            >
                                Record as Debt
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Manager Override Modal */}
        <Dialog open={isOverrideModalOpen} onOpenChange={setIsOverrideModalOpen}>
            <DialogContent className="max-w-md p-0 overflow-hidden rounded-2xl border-border/60">
                <div className="h-2 bg-destructive" />
                <div className="p-8">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-destructive text-2xl font-black tracking-tighter">
                            <AlertTriangle className="h-8 w-8" />
                            AUTHORIZATION REQUIRED
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm font-medium leading-relaxed pt-2">
                            A critical inventory breach was detected (Asset volume below -20). 
                            Standard employee access is restricted for this volume level. 
                            Please provide manager credentials to bypass the failsafe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-3">
                        <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-muted-foreground block">Manager Security Key</Label>
                        <Input 
                            type="password" 
                            placeholder="••••••••"
                            className="h-16 text-center text-3xl tracking-[1em] font-black bg-muted/50 border-border/60 focus:ring-destructive/20 focus:border-destructive/50 transition-all rounded-xl"
                            value={overridePassword}
                            onChange={(e) => setOverridePassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleOverrideSubmit} className="h-14 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]">
                            Bypass Failsafe
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOverrideModalOpen(false)} className="h-10 text-muted-foreground hover:text-foreground font-bold text-xs uppercase transition-all">
                            Cancel Transaction
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    </div>
  )
}

function ProductCard({ product, onAdd }: { product: any, onAdd: () => void }) {
  return (
    <Card 
        className="bg-zinc-900/40 border-white/5 hover:border-amber-500/30 transition-all cursor-pointer group active:scale-[0.97] rounded-2xl overflow-hidden shadow-2xl relative"
        onClick={onAdd}
    >
        <CardContent className="p-0 overflow-hidden h-40 bg-white/5 flex items-center justify-center relative">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300 z-10">
                <div className="bg-amber-500 text-black h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/40">
                    <Plus className="h-5 w-5" />
                </div>
            </div>
            {product.image ? (
                <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700 opacity-90 group-hover:opacity-100" alt={product.name} />
            ) : (
                <div className="w-full h-full flex items-center justify-center group-hover:bg-white/5 transition-all duration-500">
                    <div className="h-16 w-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20 group-hover:scale-110 transition-all duration-500 text-amber-500">
                      <ShoppingCart className="h-8 w-8" />
                    </div>
                </div>
            )}
            <div className="absolute bottom-3 left-3 flex gap-1">
                 <Badge className="bg-black/60 backdrop-blur-md text-[9px] border-white/5 uppercase tracking-tighter text-amber-500/80 font-black py-0.5">{product.category_name}</Badge>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-5 gap-0.5">
            <h3 className="text-sm font-black text-white tracking-tight group-hover:text-amber-500 transition-colors uppercase">{product.name}</h3>
            <div className="flex justify-between w-full items-center mt-1">
                <span className="text-amber-500 font-black text-sm tracking-tighter">ETB {product.price}</span>
                <span className="text-[10px] text-zinc-500 font-bold uppercase group-hover:text-amber-400 transition-colors tracking-widest">Select</span>
            </div>
        </CardFooter>
    </Card>
  )
}
