"use client"

import { useState, useEffect } from "react"
import { 
  GlassWater, 
  History, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  User, 
  Plus, 
  Search, 
  AlertTriangle,
  Receipt,
  Beef,
  DollarSign,
  ClipboardList,
  TrendingUp,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getFnbProducts, createFnbSale, getEmployeeFnbSales, getFnbInventoryStatus } from "@/lib/api"
import { logout } from "@/lib/auth"
import { useRouter } from "next/navigation"

export function FnbDashboard() {
  const [activeTab, setActiveTab] = useState("sales")
  const [products, setProducts] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false)
  const [overridePassword, setOverridePassword] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [prods, hist, inv] = await Promise.all([
        getFnbProducts(),
        getEmployeeFnbSales(),
        getFnbInventoryStatus()
      ])
      setProducts(prods || [])
      setSalesHistory(hist || [])
      setInventory(inv || [])
    } catch (err) {
      console.error("Error fetching Diva Lounge data:", err)
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

  const handleCheckout = async (isOverride = false) => {
    if (cart.length === 0) return
    const total_amount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    try {
      await createFnbSale({
        items: cart.map(item => ({ menu_product_id: item.id, quantity: item.quantity })),
        total_amount: total_amount,
        manager_override: isOverride
      })
      setCart([])
      setIsOverrideModalOpen(false)
      setOverridePassword("")
      fetchData()
    } catch (err: any) {
      if (err.message?.includes("Manager override required")) {
        setIsOverrideModalOpen(true)
      } else {
        alert(err.message || "Sale failed. Please try again.")
      }
    }
  }

  const handleOverrideSubmit = () => {
    if (overridePassword === "manager123") {
      handleCheckout(true)
    } else {
      alert("Invalid Manager Password")
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0)

  return (
    <div className="min-h-screen bg-[#060608] text-zinc-100 flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0a0a0c] flex flex-col pt-6 pb-6 px-4 shrink-0 transition-all">
        <div className="flex items-center gap-3 px-2 mb-10 group">
          <div className="h-10 w-10 bg-gradient-to-tr from-amber-600 to-amber-400 rounded-xl flex items-center justify-center rotate-45 shadow-lg shadow-amber-500/20 group-hover:rotate-0 transition-all duration-500">
            <GlassWater className="h-6 w-6 text-black -rotate-45 group-hover:rotate-0 transition-all duration-500" />
          </div>
          <div>
            <h1 className="font-black text-lg leading-none tracking-tighter">DIVA</h1>
            <p className="text-[9px] text-amber-500/80 font-bold tracking-widest uppercase">Addis Lounge</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard className="h-5 w-5" />} 
            label="Service Desk" 
            active={activeTab === "sales"} 
            onClick={() => setActiveTab("sales")} 
          />
          <SidebarItem 
            icon={<History className="h-5 w-5" />} 
            label="Lounge Logs" 
            active={activeTab === "history"} 
            onClick={() => setActiveTab("history")} 
          />
          <SidebarItem 
            icon={<Beef className="h-5 w-5" />} 
            label="Liquid Assets" 
            active={activeTab === "inventory"} 
            onClick={() => setActiveTab("inventory")} 
          />
          <SidebarItem 
            icon={<DollarSign className="h-5 w-5" />} 
            label="Revenue Hub" 
            active={activeTab === "finances"} 
            onClick={() => setActiveTab("finances")} 
          />
        </nav>

        <div className="mt-auto pt-6 border-t border-white/5">
             <Button variant="ghost" className="w-full justify-start text-zinc-500 hover:text-white hover:bg-white/5 group" onClick={handleLogout}>
                <LogOut className="mr-3 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                End Session
             </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen relative bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-zinc-900/40 via-transparent to-transparent">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/40 backdrop-blur-xl sticky top-0 z-50">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <Search className="h-4 w-4 text-zinc-500" />
                <Input 
                   placeholder="Search menu, assets, or logs..." 
                   className="bg-white/5 border-white/10 text-sm h-11 focus:ring-1 focus:ring-amber-500/30 transition-all"
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-6 ml-10">
                <div className="text-right">
                    <p className="text-sm font-black">Zebene M.</p>
                    <Badge variant="outline" className="text-[9px] border-amber-500/30 text-amber-500 bg-amber-500/5 py-0 px-2 font-bold tracking-widest uppercase">Bar Manager</Badge>
                </div>
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 flex items-center justify-center border border-amber-500/30 text-amber-500 shadow-inner">
                    <User className="h-5 w-5" />
                </div>
            </div>
        </header>

        <div className="flex-1 overflow-hidden p-8 flex flex-col">
            {activeTab === "sales" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full min-h-0">
                    <div className="lg:col-span-2 flex flex-col space-y-6 overflow-hidden">
                        <div className="flex items-center justify-between shrink-0">
                            <div>
                                <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
                                    Menu <ChevronRight className="h-6 w-6 text-amber-500/50" />
                                    <span className="text-amber-500">{selectedCategory}</span>
                                </h2>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Select items to fulfill experience</p>
                            </div>
                            <div className="flex gap-2">
                                {["All", "Bar", "Kitchen", "Spirits", "Wine"].map(cat => (
                                    <Badge 
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={cn(
                                            "cursor-pointer transition-all h-9 px-4 font-bold border",
                                            selectedCategory === cat 
                                              ? "bg-amber-500 text-black border-amber-500 shadow-lg shadow-amber-500/20" 
                                              : "bg-white/5 text-zinc-400 hover:bg-white/10 border-transparent hover:border-white/10"
                                        )}
                                        variant="outline"
                                    >
                                        {cat}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        
                        <ScrollArea className="flex-1 pr-4">
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-12">
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
                    <Card className="bg-[#0a0a0c] border-white/5 flex flex-col overflow-hidden h-full shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-amber-700" />
                        <CardHeader className="pb-4 border-b border-white/5 pt-6">
                            <CardTitle className="flex justify-between items-center text-lg font-black tracking-tight">
                                <span>Experience Summary</span>
                                <Receipt className="h-5 w-5 text-amber-500" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                            <ScrollArea className="flex-1 p-6">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-700 opacity-40">
                                        <div className="h-16 w-16 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-4">
                                            <Plus className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-black uppercase tracking-widest">Awaiting Selections</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item: any) => (
                                            <div key={item.id} className="flex justify-between items-center group bg-white/2 p-3 rounded-lg border border-transparent hover:border-white/5 transition-all">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-zinc-100">{item.name}</span>
                                                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">ETB {item.price} × {item.quantity}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-sm font-black text-amber-500">{(item.price * item.quantity).toFixed(2)}</span>
                                                    <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="h-7 w-7 rounded-lg hover:bg-red-500/10 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all border border-transparent hover:border-red-500/20"
                                                      onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))}
                                                    >
                                                        <Plus className="h-3 w-3 rotate-45" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                            
                            <div className="p-6 bg-zinc-950 border-t border-white/5 space-y-5">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                        <span>Contribution Subtotal</span>
                                        <span>ETB {subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-xs font-black uppercase text-zinc-400">Total Experience</span>
                                        <span className="text-3xl font-black text-amber-500 tracking-tighter">ETB {subtotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button 
                                  className="w-full h-16 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-amber-500/20 active:scale-[0.98] transition-all rounded-xl border-b-4 border-amber-700" 
                                  disabled={cart.length === 0}
                                  onClick={() => handleCheckout()}
                                >
                                    Record Fulfillment
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "history" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col">
                    <div className="shrink-0">
                        <h2 className="text-3xl font-black tracking-tight">Lounge Logs</h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Chronological record of lounge activity</p>
                    </div>
                    <Card className="bg-[#0a0a0c] border-white/5 flex-1 min-h-0 flex flex-col shadow-xl">
                        <CardHeader className="shrink-0 flex flex-row items-center justify-between border-b border-white/5">
                            <CardTitle className="text-lg font-black tracking-tight">Recent Sales Ledger</CardTitle>
                            <Badge className="bg-white/5 text-zinc-500 font-mono">COUNT: {salesHistory.length}</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 p-0">
                            <ScrollArea className="h-full">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-950/50 border-b border-white/5 text-[10px] uppercase tracking-widest font-black text-zinc-600 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-8 py-5">Reference</th>
                                            <th className="px-8 py-5">Experience Items</th>
                                            <th className="px-8 py-5">Volume (ETB)</th>
                                            <th className="px-8 py-5">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {salesHistory.length > 0 ? salesHistory.map((sale: any) => (
                                            <tr key={sale.id} className="hover:bg-white/[0.02] group transition-colors">
                                                <td className="px-8 py-6 font-mono text-amber-500 font-black text-xs">#DL-{sale.id}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {(sale.items || []).map((i: any, idx: number) => (
                                                            <Badge key={idx} variant="outline" className="border-white/10 text-zinc-300 bg-white/5 font-medium">
                                                                {i.menu_product_name} <span className="text-amber-500/60 ml-1 ml-1 font-black">×{i.quantity}</span>
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 font-black text-zinc-100">ETB {sale.total_amount}</td>
                                                <td className="px-8 py-6 text-zinc-500 text-xs font-bold uppercase">{new Date(sale.timestamp).toLocaleString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="py-20 text-center text-zinc-600 font-black uppercase tracking-widest opacity-30">No logs found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "inventory" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col">
                    <div className="flex items-center justify-between shrink-0">
                        <div>
                            <h2 className="text-3xl font-black tracking-tight">Liquid Assets</h2>
                            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Real-time inventory and ingredient health</p>
                        </div>
                        <Button className="bg-amber-500 hover:bg-amber-400 text-black font-black h-12 px-8 rounded-xl shadow-lg shadow-amber-500/10 border-b-2 border-amber-700 active:scale-95">
                            <Plus className="mr-2 h-4 w-4" /> Stock Adjustment
                        </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                        <StatCard title="Critical Assets" value={inventory.filter(i => i.is_low).length} color="text-red-500" icon={<AlertTriangle className="h-6 w-6" />} />
                        <StatCard title="Liquid SKUs" value={inventory.length} color="text-zinc-100" icon={<ClipboardList className="h-6 w-6" />} />
                    </div>

                    <Card className="bg-[#0a0a0c] border-white/5 flex-1 min-h-0 flex flex-col shadow-xl">
                        <CardHeader className="shrink-0 border-b border-white/5">
                            <CardTitle className="text-lg font-black tracking-tight">Ingredient Health Monitor</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-0 p-0">
                             <ScrollArea className="h-full">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-zinc-950 border-b border-white/5 text-[10px] uppercase font-black text-zinc-600 sticky top-0 z-10 tracking-widest px-8">
                                        <tr>
                                            <th className="px-8 py-5">Asset Name</th>
                                            <th className="px-8 py-5">Net Volume</th>
                                            <th className="px-8 py-5">Alert Ceiling</th>
                                            <th className="px-8 py-5">Health</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 font-sans">
                                        {inventory.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="px-8 py-6 font-black text-zinc-100 tracking-tight">{item.name}</td>
                                                <td className="px-8 py-6 text-zinc-300 font-mono text-sm">
                                                    <span className={cn(parseFloat(item.total_stock) < 0 ? "text-red-500 font-black" : "text-zinc-300")}>
                                                        {parseFloat(item.total_stock).toFixed(2)}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-600 ml-1 font-bold uppercase">UNITS</span>
                                                </td>
                                                <td className="px-8 py-6 text-zinc-500 font-bold text-xs">{item.low_stock_threshold} UNITS</td>
                                                <td className="px-8 py-6">
                                                    {item.is_low ? (
                                                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-red-500/20 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">Critical Low</Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="border-emerald-500/20 text-emerald-500 bg-emerald-500/5 px-3 py-1 font-black text-[10px] uppercase tracking-tighter">Optimal</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === "finances" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="shrink-0">
                        <h2 className="text-3xl font-black tracking-tight">Revenue Analysis</h2>
                        <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Lounge financial health and volume metrics</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <StatCard 
                            title="Shift Revenue" 
                            value={`ETB ${salesHistory.reduce((s, b) => s + parseFloat(b.total_amount), 0).toFixed(2)}`} 
                            color="text-amber-500" 
                            icon={<DollarSign className="h-6 w-6" />} 
                        />
                        <StatCard title="Fulfillments" value={salesHistory.length} color="text-zinc-100" icon={<Receipt className="h-6 w-6" />} />
                        <StatCard title="Growth Volume" value="+12.4%" color="text-emerald-500" icon={<TrendingUp className="h-6 w-6" />} />
                    </div>
                    <Card className="bg-[#0a0a0c] border-white/5 border-dashed mt-8 shadow-inner">
                        <CardContent className="py-24 flex flex-col items-center justify-center text-zinc-500 text-center">
                            <div className="h-20 w-20 rounded-full border-2 border-dashed border-zinc-800 flex items-center justify-center mb-6 animate-pulse">
                                <TrendingUp className="h-8 w-8 opacity-20" />
                            </div>
                            <h4 className="text-sm font-black text-zinc-300 uppercase tracking-[0.2em] mb-3">Revenue Hub Synchronization</h4>
                            <p className="text-xs font-bold text-zinc-600 max-w-sm leading-relaxed">
                                All Diva Lounge Addis transactions are automatically tagged and integrated into the global MasePrinting financial dashboard. Management can view consolidated reports in the central admin panel.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>

        {/* Manager Override Modal */}
        <Dialog open={isOverrideModalOpen} onOpenChange={setIsOverrideModalOpen}>
            <DialogContent className="bg-zinc-950 border-white/10 text-white shadow-2xl rounded-2xl p-0 overflow-hidden max-w-md">
                <div className="h-2 bg-red-600" />
                <div className="p-8">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-red-500 text-2xl font-black tracking-tighter">
                            <AlertTriangle className="h-8 w-8" />
                            AUTHORIZATION REQUIRED
                        </DialogTitle>
                        <DialogDescription className="text-zinc-400 text-sm font-medium leading-relaxed pt-2">
                            A critical inventory breach was detected (Asset volume below -20). 
                            Standard employee access is restricted for this volume level. 
                            Please provide manager credentials to bypass the failsafe.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-3">
                        <Label className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 block">Manager Security Key</Label>
                        <Input 
                            type="password" 
                            placeholder="••••••••"
                            className="bg-white/5 border-white/10 h-16 text-center text-3xl tracking-[1em] font-black focus:ring-red-500/20 focus:border-red-500/50 transition-all rounded-xl"
                            value={overridePassword}
                            onChange={(e) => setOverridePassword(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button onClick={handleOverrideSubmit} className="h-14 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all active:scale-[0.98]">
                            Bypass Failsafe
                        </Button>
                        <Button variant="ghost" onClick={() => setIsOverrideModalOpen(false)} className="h-10 text-zinc-600 hover:text-white font-bold text-xs uppercase transition-all">
                            Cancel Transaction
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      </main>
    </div>
  )
}

function SidebarItem({ icon, label, active, onClick }: { icon: any, label: string, active: boolean, onClick: () => void }) {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className={cn(
        "w-full justify-start h-12 rounded-xl transition-all font-black text-[11px] uppercase tracking-widest group px-5 border border-transparent mb-1",
        active 
          ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20 border-amber-400/50" 
          : "text-zinc-500 hover:text-white hover:bg-white/5"
      )}
    >
      <span className={cn("mr-4 transition-transform group-hover:scale-110", active ? "text-black" : "text-zinc-700 group-hover:text-amber-500")}>
        {icon}
      </span>
      {label}
    </Button>
  )
}

function ProductCard({ product, onAdd }: { product: any, onAdd: () => void }) {
  return (
    <Card 
        className="bg-[#0a0a0c] border border-white/5 hover:border-amber-500/40 transition-all cursor-pointer group active:scale-[0.97] rounded-2xl overflow-hidden shadow-lg shadow-black/40"
        onClick={onAdd}
    >
        <CardContent className="p-0 overflow-hidden h-40 bg-zinc-900 flex items-center justify-center relative shadow-inner">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                <div className="bg-amber-500 text-black h-10 w-10 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/40 border-b-2 border-amber-700">
                    <Plus className="h-5 w-5" />
                </div>
            </div>
            {product.image ? (
                <img src={product.image} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
            ) : (
                <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 w-full h-full flex items-center justify-center group-hover:bg-zinc-800 transition-all duration-500">
                    <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:border-amber-500/20 transition-all duration-500">
                        <GlassWater className="h-8 w-8 text-zinc-700 group-hover:text-amber-500/50 transition-colors duration-500" />
                    </div>
                </div>
            )}
            <div className="absolute bottom-3 left-3 flex gap-1">
                 <Badge className="bg-black/60 backdrop-blur-md text-[9px] border-white/10 uppercase tracking-tighter text-zinc-400 py-0.5">{product.category_name}</Badge>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start p-5 gap-0.5 bg-gradient-to-b from-transparent to-black/20">
            <h3 className="text-sm font-black text-zinc-100 tracking-tight group-hover:text-amber-500 transition-colors">{product.name}</h3>
            <div className="flex justify-between w-full items-center mt-1">
                <span className="text-amber-500 font-black text-sm tracking-tighter">ETB {product.price}</span>
                <span className="text-[10px] text-zinc-700 font-bold uppercase group-hover:text-zinc-500 transition-colors">Select Order</span>
            </div>
        </CardFooter>
    </Card>
  )
}

function StatCard({ title, value, color, icon }: { title: string, value: any, color: string, icon: any }) {
    return (
        <Card className="bg-[#0a0a0c] border border-white/5 rounded-2xl shadow-xl overflow-hidden group hover:border-white/10 transition-all">
            <CardContent className="p-7 flex items-center gap-5">
                <div className={cn("h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner", color)}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-600 mb-1">{title}</p>
                    <p className={cn("text-3xl font-black tracking-tighter", color)}>{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
