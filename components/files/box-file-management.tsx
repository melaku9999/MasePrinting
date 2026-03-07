"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { 
  Search, 
  FolderOpen, 
  FileText, 
  Upload, 
  Eye, 
  Plus, 
  HardDrive, 
  Users, 
  Clock, 
  Activity, 
  Lock,
  Unlock,
  Archive,
  ArrowRight,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List as ListIcon,
  Filter
} from "lucide-react"
import { boxFilesApi, customersApi, documentsApi } from "@/lib/api"
import { toast } from "sonner"
import { BoxFileDetails } from "./box-file-details"
import { cn } from "@/lib/utils"

export function BoxFileManagement() {
  const [viewMode, setViewMode] = useState<'registry' | 'details'>('registry')
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [backendBoxFiles, setBackendBoxFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Upload State
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadMode, setUploadMode] = useState<'existing' | 'new'>('existing')
  const [uploadCustomerId, setUploadCustomerId] = useState("")
  const [newBoxFileName, setNewBoxFileName] = useState("")
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [documentName, setDocumentName] = useState("")
  const [customers, setCustomers] = useState<any[]>([])

  const fetchBoxFiles = async () => {
    try {
      setLoading(true)
      const data = await boxFilesApi.list()
      setBackendBoxFiles(data || [])
    } catch (e: any) {
      toast.error("Repository synchronization failed")
    } finally {
      setLoading(false)
    }
  }

  const fetchCustomers = async () => {
    try {
      const data = await customersApi.getAll()
      if (data && data.results) setCustomers(data.results)
      else if (Array.isArray(data)) setCustomers(data)
    } catch (e) {
      console.error('Failed to load customers', e)
    }
  }

  useEffect(() => {
    fetchBoxFiles()
    fetchCustomers()
  }, [])

  const filteredBoxFiles = backendBoxFiles.filter(bf => 
    `${bf.label} ${bf.customer_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenDetails = (id: string) => {
    setSelectedBoxId(id)
    setViewMode('details')
  }

  const handleUpload = async () => {
    if (!selectedFiles || !documentName || !uploadCustomerId) {
      toast.error("Required manifest data missing")
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', selectedFiles[0])
      formData.append('document_name', documentName)
      
      if (uploadMode === 'existing') {
        formData.append('box_file_id', uploadCustomerId)
        await documentsApi.upload(formData)
      } else {
        formData.append('boxfile_name', newBoxFileName)
        formData.append('customer_id', uploadCustomerId)
        await boxFilesApi.createWithUpload(formData)
      }
      
      toast.success("Assets synchronized successfully")
      setShowUploadDialog(false)
      fetchBoxFiles()
    } catch (e) {
      toast.error("Upload synchronization failed")
    }
  }

  if (viewMode === 'details' && selectedBoxId) {
    return <BoxFileDetails id={selectedBoxId} onBack={() => setViewMode('registry')} />
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Storage Registry</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Physical-to-Digital Asset Repositories & Manifests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowUploadDialog(true)}
            className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-lg transition-all active:scale-95"
          >
            <Upload className="h-4 w-4 mr-2" /> Ingest Assets
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Repositories", value: backendBoxFiles.length, icon: HardDrive, color: "bg-blue-50 text-blue-600" },
          { label: "Available Assets", value: backendBoxFiles.filter(b => b.status === 'active').length, icon: Unlock, color: "bg-emerald-50 text-emerald-600" },
          { label: "Restricted Access", value: backendBoxFiles.filter(b => b.status !== 'active').length, icon: Lock, color: "bg-orange-50 text-orange-600" },
          { label: "Digital Density", value: backendBoxFiles.reduce((sum, b) => sum + (b.documents?.length || 0), 0), icon: FileText, color: "bg-purple-50 text-purple-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow group rounded-2xl overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
                </div>
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-sm", stat.color)}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Refined Control Bar */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search by repository name, customer, or identifier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 h-11">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md bg-slate-50 shadow-sm"><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-md text-slate-400 hover:text-slate-900"><ListIcon className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Refined Repository Registry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-64 rounded-2xl bg-white border border-slate-100 animate-pulse" />
          ))
        ) : filteredBoxFiles.length > 0 ? (
          filteredBoxFiles.map((bf) => (
            <Card 
              key={bf.id} 
              className="group hover:shadow-md transition-all duration-300 border-slate-200 bg-white overflow-hidden flex flex-col cursor-pointer"
              onClick={() => handleOpenDetails(String(bf.id))}
            >
              <div className="h-1.5 w-full bg-slate-900 opacity-80 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 font-black text-xl shadow-sm group-hover:bg-slate-900 group-hover:text-white transition-all">
                    <Archive className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge className={cn(
                      "font-bold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-tighter",
                      bf.status === "active" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                    )}>
                      {bf.status || 'PENDING'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4 mb-6 flex-1">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight group-hover:text-slate-700 transition-colors">
                      {bf.label}
                    </h3>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-1">REP-{bf.id}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ownership</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{bf.customer_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Density</p>
                      <p className="text-sm font-bold text-slate-900">{bf.documents?.length || 0} Assets</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center text-slate-400 text-xs gap-1 font-bold uppercase tracking-tighter">
                    <Clock className="h-3 w-3" />
                    Sync: {bf.last_checked_in_at ? new Date(bf.last_checked_in_at).toLocaleDateString() : '--'}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-slate-600 hover:text-slate-900 hover:bg-slate-50 group/btn"
                  >
                    View Manifest <ChevronRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-24 bg-white rounded-3xl border border-slate-100 border-dashed flex flex-col items-center justify-center">
            <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-6">
              <FolderOpen className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-widest">Registry Empty</h3>
            <p className="text-slate-500 text-center max-w-sm mb-8 font-medium">
              No repositories identified in the central manifest. Initialize your first asset ingestion to begin.
            </p>
            <Button onClick={() => setShowUploadDialog(true)} className="h-11 bg-slate-900 hover:bg-slate-800 text-white shadow-md px-8 rounded-lg font-bold uppercase tracking-widest text-xs">
              <Plus className="h-4 w-4 mr-2" />
              Incorporate First Asset
            </Button>
          </div>
        )}
      </div>

      {/* Upload Asset Dialog - Refined Aesthetic */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-3xl rounded-2xl border-none shadow-2xl p-0 overflow-hidden bg-white">
          <div className="px-8 py-6 border-b border-slate-100">
            <DialogTitle className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
              <Upload className="h-6 w-6 text-slate-900" />
              Asset Ingestion
            </DialogTitle>
            <p className="text-slate-500 text-sm mt-1">Synchronize digital assets with the central repository manifest.</p>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant={uploadMode === 'existing' ? 'default' : 'outline'}
                onClick={() => setUploadMode('existing')}
                className={cn(
                  "h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                  uploadMode === 'existing' ? "bg-slate-900 shadow-xl" : "border-slate-200 text-slate-400"
                )}
              >
                Existing Repository
              </Button>
              <Button 
                variant={uploadMode === 'new' ? 'default' : 'outline'}
                onClick={() => setUploadMode('new')}
                className={cn(
                  "h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all",
                  uploadMode === 'new' ? "bg-slate-900 shadow-xl" : "border-slate-200 text-slate-400"
                )}
              >
                Initiate New
              </Button>
            </div>

            <div className="space-y-6">
              {uploadMode === 'new' && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Repository Designation</Label>
                  <Input 
                    placeholder="Enter designation name..." 
                    value={newBoxFileName}
                    onChange={e => setNewBoxFileName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 font-bold"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Manifest</Label>
                  <Select value={uploadCustomerId} onValueChange={setUploadCustomerId}>
                    <SelectTrigger className="h-12 rounded-xl border-slate-200 font-bold">
                      <SelectValue placeholder={uploadMode === 'existing' ? "Identify Repository" : "Identify Customer"} />
                    </SelectTrigger>
                    <SelectContent>
                      {uploadMode === 'existing' ? (
                        backendBoxFiles.map(bf => (
                          <SelectItem key={bf.id} value={String(bf.id)} className="font-bold">{bf.label}</SelectItem>
                        ))
                      ) : (
                        customers.map(c => (
                          <SelectItem key={c.id} value={String(c.id)} className="font-bold">{c.name}</SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Designation</Label>
                  <Input 
                    placeholder="Document title..." 
                    value={documentName}
                    onChange={e => setDocumentName(e.target.value)}
                    className="h-12 rounded-xl border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div className="relative group">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  onChange={e => setSelectedFiles(e.target.files)}
                />
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-50 group-hover:bg-slate-100 group-hover:border-slate-900 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center mb-4 text-slate-900 group-hover:rotate-12 transition-transform">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Select Source Assets</h4>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                    {selectedFiles ? `${selectedFiles.length} item(s) staged` : "Drag and drop or browse local storage"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setShowUploadDialog(false)} className="h-12 px-6 rounded-xl font-black text-xs uppercase tracking-widest">Cancel</Button>
              <Button 
                onClick={handleUpload}
                disabled={!selectedFiles || !documentName || !uploadCustomerId}
                className="h-12 px-10 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
              >
                Incorporate Assets
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
