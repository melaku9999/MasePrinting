"use client"

import { useState, useEffect } from "react"
import { 
  History, 
  Search,
  DollarSign,
  Receipt,
  Download
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getEmployeeFnbSales } from "@/lib/api"
import { toast } from "sonner"

export function LoungeLogs() {
  const [salesHistory, setSalesHistory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const hist = await getEmployeeFnbSales()
      setSalesHistory(hist || [])
    } catch (err) {
      console.error("Error fetching logs:", err)
      toast.error("Failed to load lounge logs")
    }
  }

  const filteredLogs = salesHistory.filter(sale => 
    String(sale.id).includes(searchQuery) ||
    sale.items?.some((i: any) => i.menu_product_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const totalVolume = salesHistory.reduce((sum, s) => sum + parseFloat(s.total_amount), 0)

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full overflow-hidden flex flex-col bg-[#0a0a0b] text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between shrink-0 gap-4">
            <div>
                <h2 className="text-3xl font-black tracking-tight text-white flex items-center gap-3">
                    Fulfillment Logs
                    <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase tracking-[0.2em] text-[10px] font-black">Archive</Badge>
                </h2>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Immutable chronological record of lounge operations</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input 
                        placeholder="Search reference..." 
                        className="pl-11 h-12 bg-zinc-900/40 border-white/5 text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:ring-amber-500/20 rounded-2xl font-bold transition-all"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="h-12 border-white/5 bg-white/5 hover:bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-2xl px-6">
                    <Download className="mr-2 h-4 w-4" /> Data Export
                </Button>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 shrink-0">
            <StatCard title="Session Liquidity" value={`ETB ${totalVolume.toFixed(2)}`} color="text-amber-500" icon={<DollarSign className="h-6 w-6" />} />
            <StatCard title="Fulfillment Count" value={salesHistory.length} color="text-white" icon={<Receipt className="h-6 w-6" />} />
            <StatCard title="System Readiness" value={salesHistory.length > 0 ? "LIVE" : "IDLE"} color="text-emerald-500" icon={<History className="h-6 w-6" />} />
        </div>

        <Card className="bg-zinc-900/40 border-white/5 flex-1 min-h-0 flex flex-col shadow-2xl overflow-hidden rounded-2xl backdrop-blur-xl">
            <CardHeader className="shrink-0 flex flex-row items-center justify-between border-b border-white/5 bg-black/20 p-6">
                <CardTitle className="text-lg font-black tracking-[0.2em] text-white uppercase">Sales Ledger</CardTitle>
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none font-black text-[10px] tracking-widest px-4 py-1.5 uppercase">Audit Trail: {salesHistory.length} Nodes</Badge>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-full">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 border-b border-white/5 text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 sticky top-0 z-10">
                            <tr>
                                <th className="px-8 py-5">Global Reference</th>
                                <th className="px-8 py-5">Inventory Manifest</th>
                                <th className="px-8 py-5">Volume Magnitude</th>
                                <th className="px-8 py-5">Temporal Stamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredLogs.map((sale: any) => (
                                <tr key={sale.id} className="hover:bg-white/[0.02] group transition-colors">
                                    <td className="px-8 py-6 font-mono text-amber-500 font-black text-sm tracking-tighter">#DLX-{sale.id.toString().padStart(6, '0')}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-wrap gap-2">
                                            {(sale.items || []).map((i: any, idx: number) => (
                                                <Badge key={idx} variant="outline" className="border-white/10 text-zinc-400 bg-white/5 font-black text-[9px] uppercase tracking-widest px-2.5 py-1">
                                                    {i.menu_product_name} <span className="text-amber-500/60 ml-1">×{i.quantity}</span>
                                                </Badge>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 font-black text-white text-base">ETB {parseFloat(sale.total_amount).toLocaleString()}</td>
                                    <td className="px-8 py-6 text-zinc-500 text-xs font-black uppercase tracking-widest">{new Date(sale.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-32 text-center text-zinc-800 font-black uppercase tracking-[0.4em] text-xs">No historical records visualized</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </ScrollArea>
            </CardContent>
        </Card>
    </div>
  )
}

function StatCard({ title, value, color, icon }: { title: string, value: any, color: string, icon: any }) {
    return (
        <Card className="bg-zinc-900/40 border border-white/5 rounded-2xl shadow-2xl overflow-hidden group hover:border-amber-500/20 transition-all backdrop-blur-xl">
            <CardContent className="p-7 flex items-center gap-6">
                <div className={cn("h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5", color)}>
                    {icon}
                </div>
                <div className="flex flex-col">
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] text-zinc-500 mb-1.5">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter leading-none">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
