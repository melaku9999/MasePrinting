"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MoreHorizontal, Mail, Phone, Clock, CheckCircle, Archive, Trash2, Search, Filter, Loader2 } from "lucide-react"
import { cmsApi } from "@/lib/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"

export function InquiryList() {
  const [inquiries, setInquiries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchInquiries = async () => {
    try {
      const data = await cmsApi.getInquiries()
      if (data && typeof data === 'object' && 'results' in data) {
        setInquiries((data as any).results || [])
      } else {
        setInquiries(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error("Failed to load inquiries")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInquiries()
  }, [])

  const results = Array.isArray(inquiries) ? inquiries : []
  
  const filteredInquiries = results.filter(
    (iq) =>
      iq.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iq.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      iq.message?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const updateStatus = async (id: string | number, newStatus: string) => {
    try {
      await cmsApi.updateInquiryStatus(id, newStatus)
      setInquiries(inquiries.map((iq) => (iq.id === id ? { ...iq, status: newStatus } : iq)))
      toast.success(`Inquiry marked as ${newStatus}`)
    } catch (error) {
      toast.error("Failed to update status")
    }
  }

  const deleteInquiry = async (id: string | number) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return
    try {
      await cmsApi.deleteInquiry(id)
      setInquiries(inquiries.filter((iq) => iq.id !== id))
      toast.success("Inquiry deleted")
    } catch (error) {
      toast.error("Failed to delete inquiry")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-none">New</Badge>
      case "responded":
        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none">Responded</Badge>
      case "archived":
        return <Badge variant="secondary" className="bg-slate-500/10 text-slate-600 border-none">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">Lead Manifest</h1>
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Public Engagement & Strategic Inquiries Pipeline</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-3 w-full bg-slate-50/50 p-2 rounded-xl border border-slate-100">
        <div className="relative flex-1 group w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
          <Input
            placeholder="Search leads by name, email or intent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-slate-900 rounded-lg placeholder:text-slate-400 text-sm"
          />
        </div>
        <Button variant="outline" size="icon" className="h-11 w-11 border-0 bg-white shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 rounded-lg shrink-0">
          <Filter className="h-4 w-4 text-slate-400" />
        </Button>
      </div>

      <Card className="border-none shadow-sm bg-card/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[200px] text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Strategic Lead</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Engagement Context</TableHead>
                <TableHead className="w-[140px] text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Timestamp</TableHead>
                <TableHead className="w-[130px] text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6">Pipeline Status</TableHead>
                <TableHead className="w-[80px] text-[10px] font-black uppercase tracking-widest text-slate-400 h-10 px-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-gold" />
                    <p className="text-xs text-muted-foreground mt-2">Loading inquiries...</p>
                  </TableCell>
                </TableRow>
              ) : filteredInquiries.length > 0 ? (
                filteredInquiries.map((iq) => (
                  <TableRow key={iq.id} className="group hover:bg-accent/5 transition-colors border-border/40">
                    <TableCell className="align-top py-4">
                      <div className="font-medium text-sm">{iq.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" />
                        {iq.email}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" />
                        {iq.phone}
                      </div>
                      <Badge variant="outline" className="mt-2 font-normal text-[10px] uppercase tracking-wider text-slate-400">
                        {iq.business_type || "No Business Type"}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top py-4">
                        <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-3">
                            "{iq.message}"
                        </p>
                    </TableCell>
                    <TableCell className="align-top py-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(iq.created_at), { addSuffix: true })}
                        </div>
                    </TableCell>
                    <TableCell className="align-top py-4">
                      {getStatusBadge(iq.status)}
                    </TableCell>
                    <TableCell className="align-top py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateStatus(iq.id, "responded")} className="gap-2">
                            <CheckCircle className="h-4 w-4 text-emerald-500" />
                            Mark Responded
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateStatus(iq.id, "archived")} className="gap-2">
                            <Archive className="h-4 w-4" />
                            Archive
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => deleteInquiry(iq.id)} className="gap-2 text-destructive focus:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                    No inquiries found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            Showing {filteredInquiries.length} inquiries • Leads are automatically synced from contact form
        </p>
      </div>
    </div>
  )
}
