"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { 
  ArrowLeft, 
  FolderOpen, 
  FileText, 
  Users, 
  Clock, 
  Activity, 
  Download, 
  Eye, 
  Lock, 
  Unlock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { boxFilesApi, documentsApi, usersDirectoryApi } from "@/lib/api"
import { toast } from "sonner"

interface BoxFileDetailsProps {
  id: string
  onBack: () => void
}

export function BoxFileDetails({ id, onBack }: BoxFileDetailsProps) {
  const [details, setDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  
  // Checkout/Checkin state
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({})
  const [actionUserIds, setActionUserIds] = useState<Record<string, string>>({})
  
  // Ownership history dialog state
  const [historyDoc, setHistoryDoc] = useState<any>(null)

  const fetchDetails = async () => {
    try {
      setLoading(true)
      const data = await boxFilesApi.getById(id)
      setDetails(data)
    } catch (e) {
      toast.error("Failed to synchronize box file data")
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await usersDirectoryApi.listUsers()
      setUsers(data || [])
    } catch (e) {
      console.error('Failed to load users', e)
    }
  }

  useEffect(() => {
    fetchDetails()
    fetchUsers()
  }, [id])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin mb-4" />
        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Opening Repository Manifest...</p>
      </div>
    )
  }



  const handleDocAction = async (docId: string, action: 'checkout' | 'checkin') => {
    const notes = actionNotes[`doc-${docId}`]
    const userId = actionUserIds[`doc-${docId}`]

    if (!notes?.trim() || !userId) {
      toast.error("Document metadata required: Notes and Personnel must be identified")
      return
    }

    try {
      const apiCall = action === 'checkout' ? documentsApi.checkout : documentsApi.checkin
      await apiCall(docId, { notes, user_id: Number(userId) })
      toast.success(`Document ${action} synchronized`)
      fetchDetails()
      setActionNotes(prev => ({ ...prev, [`doc-${docId}`]: "" }))
      setActionUserIds(prev => ({ ...prev, [`doc-${docId}`]: "" }))
    } catch (e: any) {
      toast.error(e.error || `Document ${action} failed`)
    }
  }

  const handleDownload = async (docId: string, filename: string) => {
    try {
      toast.loading(`Preparing download: ${filename}...`)
      const blob = await documentsApi.download(docId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.dismiss()
      toast.success(`Download complete: ${filename}`)
    } catch (e) {
      toast.dismiss()
      toast.error("Download pipeline failure")
      console.error(e)
    }
  }



  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Professional Header */}
      <div className="flex flex-col gap-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onBack} 
          className="w-fit h-8 px-0 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:translate-x-[-4px]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Registry
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 shadow-sm">
              <FolderOpen className="h-8 w-8" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-slate-100 text-slate-800 border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full">
                  REP-{id}
                </Badge>
                <Badge className={cn(
                  "border-none font-black text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full",
                  details?.status === 'active' ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"
                )}>
                  {details?.status === 'active' ? <Unlock className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
                  {details?.status || 'STATUS_PENDING'}
                </Badge>
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-1">
                {details?.label || "Unidentified Box File"}
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Managed by Primary Custodian: <span className="text-slate-900 font-bold">{details?.customer_name || "Enterprise Generic"}</span>
              </p>
            </div>
          </div>
          
          
        </div>
      </div>

      <Tabs defaultValue="inventory" className="space-y-8">


        <TabsContent value="inventory" className="animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200 shadow-sm rounded-xl overflow-hidden bg-white">
                <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-black uppercase tracking-widest flex items-center gap-2 text-slate-900">
                      <FileText className="h-4 w-4" />
                      Digital Asset Catalog
                    </CardTitle>
                    <Badge variant="outline" className="text-[10px] font-black border-slate-200 bg-white">
                      {details?.documents?.length || 0} ITEMS IDENTIFIED
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-slate-100">
                    {details?.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-6 hover:bg-slate-50/50 transition-colors group">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-900 flex-shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-all">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-900 truncate flex items-center gap-2">
                                {doc.name}
                                <Badge variant="outline" className="text-[9px] font-black border-slate-200 uppercase px-1.5 h-4 bg-white">
                                  #{doc.id}
                                </Badge>
                              </h4>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Synced: {new Date(doc.uploaded_at).toLocaleDateString()}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  Holder: <span className="text-slate-900 font-bold">{doc.current_holder_name || "REGISTRY"}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9 text-slate-400 hover:text-slate-900" onClick={() => setHistoryDoc(doc)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="rounded-lg h-9 w-9 text-slate-400 hover:text-slate-900"
                              onClick={() => handleDownload(doc.id, doc.name)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Quick Action Overlay */}
                        <div className="mt-6 flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                          <div className="flex-1 min-w-[200px]">
                            <Input 
                              placeholder="Audit Remark..."
                              value={actionNotes[`doc-${doc.id}`] || ""}
                              onChange={e => setActionNotes(p => ({...p, [`doc-${doc.id}`]: e.target.value}))}
                              className="h-9 rounded-lg border-slate-200 bg-white text-xs font-bold"
                            />
                          </div>
                          <Select 
                            value={actionUserIds[`doc-${doc.id}`] || ""}
                            onValueChange={v => setActionUserIds(p => ({...p, [`doc-${doc.id}`]: v}))}
                          >
                            <SelectTrigger className="h-9 w-[180px] rounded-lg border-slate-200 bg-white text-xs font-bold">
                              <SelectValue placeholder="Identify Personnel" />
                            </SelectTrigger>
                            <SelectContent>
                              {users.map(u => (
                                <SelectItem key={u.id} value={String(u.id)} className="text-xs font-bold">
                                  {u.username}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDocAction(doc.id, 'checkout')}
                              disabled={doc.status !== 'active'}
                              className="rounded-lg h-9 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-orange-50 hover:text-orange-600 transition-all active:scale-95 shadow-sm"
                            >
                              Checkout
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDocAction(doc.id, 'checkin')}
                              disabled={doc.status === 'active'}
                              className="rounded-lg h-9 px-4 text-[10px] font-black uppercase tracking-widest border-slate-200 bg-white hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 shadow-sm"
                            >
                              Checkin
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">


              <Card className="border-slate-200 shadow-sm rounded-2xl p-6 bg-slate-50 border-dashed">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Storage Metrics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-500 uppercase">Document Density</span>
                    <span className="text-slate-900 font-extrabold">{details?.documents?.length || 0}</span>
                  </div>
                  <Progress value={(details?.documents?.length || 0) * 10} className="h-1.5 bg-slate-200" />
                  <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest">
                    Enterprise tier storage active for this repository.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>


      </Tabs>
      {/* Document Ownership History Dialog */}
      <Dialog open={!!historyDoc} onOpenChange={(open) => { if (!open) setHistoryDoc(null) }}>
        <DialogContent className="sm:max-w-[520px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5 text-slate-600" />
              Ownership History
            </DialogTitle>
            <DialogDescription className="text-xs">
              {historyDoc?.name} — Full custody chain
            </DialogDescription>
          </DialogHeader>

          {/* Current Holder */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Holder</p>
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center shadow-sm border",
                historyDoc?.current_holder_name ? "bg-orange-50 border-orange-200 text-orange-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"
              )}>
                {historyDoc?.current_holder_name ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{historyDoc?.current_holder_name || "Registry (No one)"}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Status: {historyDoc?.status}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Timeline */}
          <div className="space-y-3 mt-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Transaction Timeline</p>
            {historyDoc?.transactions && historyDoc.transactions.length > 0 ? (
              <div className="space-y-2">
                {[...historyDoc.transactions]
                  .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((tr: any) => (
                  <div key={tr.id} className="flex items-start gap-3 p-3 rounded-xl bg-white border border-slate-100 hover:border-slate-200 transition-all">
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5",
                      tr.action === 'checkout' ? "bg-orange-50 text-orange-500" : "bg-emerald-50 text-emerald-500"
                    )}>
                      {tr.action === 'checkout' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-slate-900">
                          {tr.handled_by_name || "Unknown User"}
                        </p>
                        <Badge variant="outline" className={cn(
                          "text-[9px] font-black uppercase tracking-widest shrink-0",
                          tr.action === 'checkout' ? "border-orange-200 text-orange-600 bg-orange-50" : "border-emerald-200 text-emerald-600 bg-emerald-50"
                        )}>
                          {tr.action === 'checkout' ? 'Checked Out' : 'Checked In'}
                        </Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                        {new Date(tr.timestamp).toLocaleDateString()} at {new Date(tr.timestamp).toLocaleTimeString()}
                      </p>
                      {tr.notes && (
                        <p className="text-xs text-slate-500 mt-1.5 italic bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
                          "{tr.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
                <Activity className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">No custody changes recorded</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1">This document has never been checked out.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
