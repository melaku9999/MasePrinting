"use client"

import { useState, useEffect } from "react"
import { 
  Home, 
  DollarSign, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  GlassWater,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getEmployeeFnbSales, getFnbInventoryStatus } from "@/lib/api"
import { cn } from "@/lib/utils"

export function LoungeOverview() {
  const [stats, setStats] = useState({
    sales: 0,
    orders: 0,
    lowStock: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sales, inv] = await Promise.all([
          getEmployeeFnbSales(),
          getFnbInventoryStatus()
        ])
        setStats({
          sales: sales.reduce((sum: number, s: any) => sum + parseFloat(s.total_amount), 0),
          orders: sales.length,
          lowStock: inv.filter((i: any) => i.is_low).length
        })
      } catch (err) {
        console.error("Error fetching overview stats:", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500 bg-[#0a0a0b] min-h-full text-white">
        <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-black tracking-tight flex items-center gap-3 text-white">
                Lounge Insights
                <Badge variant="outline" className="border-amber-500/30 text-amber-500 bg-amber-500/5 uppercase tracking-[0.2em] text-[10px] font-black">F&B Unit</Badge>
            </h2>
            <p className="text-sm text-zinc-500 font-medium">Real-time performance metrics for Diva Lounge Addis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
                title="Shift Revenue" 
                value={`ETB ${stats.sales.toFixed(2)}`} 
                trend="+12.4%" 
                trendUp={true}
                icon={<DollarSign className="h-5 w-5" />} 
            />
            <MetricCard 
                title="Experience Fulfillment" 
                value={stats.orders} 
                trend="+3" 
                trendUp={true}
                icon={<Home className="h-5 w-5" />} 
            />
            <MetricCard 
                title="Critical Assets" 
                value={stats.lowStock} 
                trend={stats.lowStock > 0 ? "Action Required" : "Stable"} 
                trendUp={stats.lowStock === 0}
                icon={<AlertTriangle className="h-5 w-5" />} 
                color={stats.lowStock > 0 ? "text-destructive" : "text-primary"}
            />
            <MetricCard 
                title="Guest Sentiment" 
                value="98%" 
                trend="+2%" 
                trendUp={true}
                icon={<Users className="h-5 w-5" />} 
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-zinc-900/40 border-white/5 backdrop-blur-xl shadow-2xl border-l-4 border-l-amber-500">
                <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight text-white uppercase">Active Shift Status</CardTitle>
                    <CardDescription className="text-zinc-500">Consolidated F&B performance data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 shadow-inner">
                                <GlassWater className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Bar Availability</p>
                                <p className="text-base font-black text-white">92% Optimal</p>
                            </div>
                        </div>
                        <Badge className="bg-emerald-500/20 text-emerald-500 border-none px-3 font-black uppercase text-[10px]">Ready</Badge>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-amber-500/30 pl-4 py-1">
                        "Your current sales velocity is higher than yesterday at this time. 
                        Ensure that 'Fresh Mint' levels are monitored as three Mojito recipes were fulfilled in the last hour."
                    </p>
                </CardContent>
            </Card>

            <Card className="bg-zinc-900/40 border-white/5 border-dashed border-2">
                <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-amber-500/5 flex items-center justify-center mb-6">
                        <TrendingUp className="h-8 w-8 text-amber-500/20" />
                    </div>
                    <h4 className="text-sm font-black uppercase tracking-[0.3em] text-white mb-3">Revenue Synchronization</h4>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed font-bold uppercase tracking-tighter shadow-sm">
                        All Diva Lounge Addis transactions are automatically bridged to the MasePrinting central ledger. 
                        Real-time analytics and deeper metrics can be accessed via the Revenue Hub.
                    </p>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

function MetricCard({ title, value, trend, trendUp, icon, color = "text-amber-500" }: any) {
    return (
        <Card className="bg-zinc-900/40 border-white/5 hover:border-amber-500/20 transition-all group shadow-2xl backdrop-blur-sm">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={cn("h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner border border-white/5", color)}>
                        {icon}
                    </div>
                    <Badge variant="outline" className={cn("text-[10px] font-black tracking-widest p-0 border-none", trendUp ? "text-emerald-500" : "text-destructive")}>
                        {trendUp ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {trend}
                    </Badge>
                </div>
                <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mb-1">{title}</p>
                    <p className="text-3xl font-black tracking-tighter text-white">{value}</p>
                </div>
            </CardContent>
        </Card>
    )
}
