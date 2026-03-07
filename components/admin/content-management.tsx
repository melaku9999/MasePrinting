"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  Layout, 
  Target, 
  BarChart3, 
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { cmsApi, servicesApi } from "@/lib/api"

export function ContentManagement() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [config, setConfig] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [configData, servicesData] = await Promise.all([
          cmsApi.getConfig(),
          servicesApi.getAll()
        ])
        setConfig(configData)
        setServices(servicesData.results || [])
      } catch (error) {
        console.error("Failed to fetch CMS data:", error)
        toast.error("Failed to load content settings")
      } finally {
        setFetching(false)
      }
    }
    fetchData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await cmsApi.updateConfig(config)
      toast.success("Changes saved successfully", {
        description: "Your landing page content has been updated."
      })
    } catch (error) {
      toast.error("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Content Editor</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Public Presence & Brand Messaging Governance</p>
        </div>
        <Button 
          type="submit" 
          disabled={loading} 
          className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Deploy Changes
        </Button>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl border border-slate-200">
          <TabsTrigger value="hero" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
            <Layout className="h-3.5 w-3.5" /> Hero Section
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
            <BarChart3 className="h-3.5 w-3.5" /> Key Statistics
          </TabsTrigger>
          <TabsTrigger value="mission" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
            <Target className="h-3.5 w-3.5" /> Mission & Vision
          </TabsTrigger>
          <TabsTrigger value="services" className="data-[state=active]:bg-slate-900 data-[state=active]:text-white rounded-lg h-8 text-[11px] font-bold uppercase gap-2 px-6 transition-all">
            <CheckCircle2 className="h-3.5 w-3.5" /> Featured Services
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Hero Messaging</CardTitle>
              <CardDescription>Control the main headline and subtext displayed at the top of the home page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="hero-badge">Announcement Badge</Label>
                <Input 
                  id="hero-badge" 
                  value={config?.hero_badge || ""} 
                  onChange={(e) => setConfig({ ...config, hero_badge: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-title">Main Headline</Label>
                <Textarea 
                  id="hero-title" 
                  value={config?.hero_title || ""} 
                  onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                  className="min-h-[80px]" 
                />
                <p className="text-[10px] text-muted-foreground">Use the text-gradient utility for the highlighted part.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hero-desc">Subtext Description</Label>
                <Textarea 
                  id="hero-desc" 
                  value={config?.hero_description || ""} 
                  onChange={(e) => setConfig({ ...config, hero_description: e.target.value })}
                  className="min-h-[100px]" 
                />
              </div>
              <div className="pt-4 border-t">
                  <Label>Hero Background Image</Label>
                  <div className="mt-2 flex items-center gap-4 p-4 border rounded-lg border-dashed bg-muted/30">
                      <div className="h-16 w-24 bg-muted rounded flex items-center justify-center overflow-hidden border">
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                          <p className="text-xs font-medium">hero-bg.jpg</p>
                          <p className="text-[10px] text-muted-foreground">Recommended: 1920x1080px • High Resolution</p>
                      </div>
                      <Button variant="outline" size="sm" type="button">Change Image</Button>
                  </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Counter Statistics</CardTitle>
              <CardDescription>Update the impact numbers shown in the stats bar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <Label>Businesses Served</Label>
                  <Input 
                    value={config?.stat_businesses_served || ""} 
                    onChange={(e) => setConfig({ ...config, stat_businesses_served: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Compliance Rate</Label>
                  <Input 
                    value={config?.stat_compliance_rate || ""} 
                    onChange={(e) => setConfig({ ...config, stat_compliance_rate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Years Experience</Label>
                  <Input 
                    value={config?.stat_years_experience || ""} 
                    onChange={(e) => setConfig({ ...config, stat_years_experience: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Response Time</Label>
                  <Input 
                    value={config?.stat_response_time || ""} 
                    onChange={(e) => setConfig({ ...config, stat_response_time: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services">
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Landing Page Services</CardTitle>
              <CardDescription>Select up to 6 services to be highlighted on the main home page.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => {
                  const isFeatured = (config?.featured_services || []).includes(svc.id)
                  return (
                    <div key={svc.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors">
                      <span className="text-sm font-medium">{svc.name}</span>
                      <Badge 
                        variant={isFeatured ? "gold" : "outline"} 
                        className="cursor-pointer"
                        onClick={() => {
                          const currentFeatured = config?.featured_services || []
                          if (isFeatured) {
                            setConfig({
                              ...config,
                              featured_services: currentFeatured.filter((id: any) => id !== svc.id)
                            })
                          } else {
                            if (currentFeatured.length >= 6) {
                                toast.error("Maximum 6 services can be featured")
                                return
                            }
                            setConfig({
                              ...config,
                              featured_services: [...currentFeatured, svc.id]
                            })
                          }
                        }}
                      >
                        {isFeatured ? "Featured" : "Add"}
                      </Badge>
                    </div>
                  )
                })}
              </div>
              <div className="mt-6 pt-6 border-t">
                  <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-3 w-3" />
                      Services listed above are pulled from your main Service Catalog.
                  </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mission">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-gold" />
                  Our Mission
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Mission Statement</Label>
                  <Textarea 
                    className="min-h-[150px]" 
                    value={config?.mission_statement || ""} 
                    onChange={(e) => setConfig({ ...config, mission_statement: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-gold" />
                  Our Vision
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Vision Statement</Label>
                  <Textarea 
                    className="min-h-[150px]" 
                    value={config?.vision_statement || ""} 
                    onChange={(e) => setConfig({ ...config, vision_statement: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                  <h4 className="text-sm font-semibold text-amber-900">Live Preview Availability</h4>
                  <p className="text-xs text-amber-800/80 mt-1">
                      Changes saved here will reflect immediately on the public landing page. Please double-check spelling and text alignment before saving.
                  </p>
              </div>
          </div>
      </div>
    </form>
  )
}
